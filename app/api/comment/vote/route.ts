/**
 * Vote Comment API Route
 * Handles upvote/downvote with idempotent transactions
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { VoteType } from "@prisma/client";
import type { VoteCommentRequest, VoteCommentResponse } from "@/types/comment";

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to vote" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VoteCommentRequest = await request.json();
    const { commentId, voteType } = body;

    // Validate commentId
    if (!commentId) {
      return NextResponse.json(
        { error: "Bad Request", message: "commentId is required" },
        { status: 400 }
      );
    }

    // Validate voteType
    if (voteType !== null && voteType !== "UP" && voteType !== "DOWN") {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid vote type" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify comment exists
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { 
        id: true, 
        votesCount: true,
        votes: {
          where: { userId },
          select: { type: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Not Found", message: "Comment not found" },
        { status: 404 }
      );
    }

    const existingVote = comment.votes[0]?.type || null;

    // Calculate vote delta
    let voteDelta = 0;
    
    if (voteType === null) {
      // Remove vote
      if (existingVote === "UP") voteDelta = -1;
      else if (existingVote === "DOWN") voteDelta = 1;
    } else if (existingVote === null) {
      // New vote
      voteDelta = voteType === "UP" ? 1 : -1;
    } else if (existingVote !== voteType) {
      // Change vote
      voteDelta = voteType === "UP" ? 2 : -2;
    }

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or delete vote record
      if (voteType === null) {
        // Remove vote
        await tx.commentVotes.deleteMany({
          where: {
            userId,
            commentId,
          },
        });
      } else {
        // Upsert vote
        await tx.commentVotes.upsert({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          create: {
            userId,
            commentId,
            type: voteType,
          },
          update: {
            type: voteType,
          },
        });
      }

      // Update comment vote count
      const updatedComment = await tx.comments.update({
        where: { id: commentId },
        data: {
          votesCount: {
            increment: voteDelta,
          },
        },
        select: {
          votesCount: true,
        },
      });

      return updatedComment;
    });

    const response: VoteCommentResponse = {
      success: true,
      votesCount: result.votesCount,
      userVote: voteType,
      message: voteType === null 
        ? "Vote removed" 
        : voteType === "UP" 
          ? "Upvoted" 
          : "Downvoted",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error voting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to vote" },
      { status: 500 }
    );
  }
}
