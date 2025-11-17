/**
 * Get Replies API Route
 * Fetches replies for a specific comment with user votes
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { ReplyListResponse } from "@/types/comment";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    // Validate commentId
    if (!commentId) {
      return NextResponse.json(
        { error: "Bad Request", message: "commentId is required" },
        { status: 400 }
      );
    }

    // Parse and validate limit
    const limit = Math.min(
      parseInt(limitParam || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );

    // Get session to check user votes
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    // Verify parent comment exists
    const parentComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "Not Found", message: "Comment not found" },
        { status: 404 }
      );
    }

    // Fetch replies with pagination
    const replies = await prisma.comments.findMany({
      where: {
        commentId,
        OR :[
          {
            isDeleted: false,
          },
          {
            AND : [
              {
                isDeleted: true,
              },
              { replies : { some: {} } }
            ]
          }
        ],
      },
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      orderBy: [
        { votesCount: "desc" },
        { createdAt: "asc" }, // Oldest first for replies
      ],
      select: {
        id: true,
        content: true,
        userId: true,
        ideaId: true,
        postId: true,
        commentId: true,
        votesCount: true,
        isDeleted: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
        ...(userId && {
          votes: {
            where: {
              userId,
            },
            select: {
              type: true,
            },
          },
        }),
      },
    });

    // Determine if there are more replies
    const hasMore = replies.length > limit;
    const repliesToReturn = hasMore ? replies.slice(0, -1) : replies;
    const nextCursor = hasMore ? repliesToReturn[repliesToReturn.length - 1].id : null;

    // Transform replies to include userVote
    const transformedReplies = repliesToReturn.map((reply) => {
      const { votes, ...rest } = reply as any;
      return {
        ...rest,
        userVote: votes?.[0]?.type || null,
      };
    });

    const response: ReplyListResponse = {
      replies: transformedReplies,
      hasMore,
      nextCursor,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}