/**
 * Create Comment API Route
 * Handles comment and reply creation with validation and security
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { CreateCommentRequest, CreateCommentResponse } from "@/types/comment";

const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 1;

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateCommentRequest = await request.json();
    const { content, ideaId, commentId } = body;

    // Validate required fields
    if (!content || !ideaId) {
      return NextResponse.json(
        { error: "Bad Request", message: "Content and ideaId are required" },
        { status: 400 }
      );
    }

    // Sanitize and validate content
    const sanitizedContent = content.trim();
    
    if (sanitizedContent.length < MIN_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: "Bad Request", message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Verify idea exists
    const ideaExists = await prisma.ideas.findUnique({
      where: { id: ideaId },
      select: { id: true },
    });

    if (!ideaExists) {
      return NextResponse.json(
        { error: "Not Found", message: "Idea not found" },
        { status: 404 }
      );
    }

    // If replying, verify parent comment exists
    if (commentId) {
      const parentComment = await prisma.comments.findUnique({
        where: { id: commentId },
        select: { id: true, ideaId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Not Found", message: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Ensure parent comment belongs to same idea
      if (parentComment.ideaId !== ideaId) {
        return NextResponse.json(
          { error: "Bad Request", message: "Parent comment does not belong to this idea" },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comments.create({
      data: {
        content: sanitizedContent,
        userId: session.user.id,
        ideaId,
        ...(commentId && { commentId }),
      },
      include: {
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
      },
    });

    const response: CreateCommentResponse = {
      comment: {
        ...comment,
        userVote: null,
      },
      message: commentId ? "Reply posted successfully" : "Comment posted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create comment" },
      { status: 500 }
    );
  }
}