/**
 * Edit Comment API Route
 * Handles comment editing with validation and ownership check
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { EditCommentRequest, EditCommentResponse } from "@/types/comment";

const MAX_COMMENT_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 1;

export async function PATCH(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to edit comments" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: EditCommentRequest = await request.json();
    const { commentId, content } = body;

    // Validate required fields
    if (!commentId || !content) {
      return NextResponse.json(
        { error: "Bad Request", message: "Comment ID and content are required" },
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

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { 
        id: true, 
        userId: true,
        isDeleted: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Not Found", message: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    if (existingComment.isDeleted) {
      return NextResponse.json(
        { error: "Bad Request", message: "Cannot edit deleted comments" },
        { status: 400 }
      );
    }

    // Update comment
    const updatedComment = await prisma.comments.update({
      where: { id: commentId },
      data: { content: sanitizedContent },
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

    const response: EditCommentResponse = {
      success: true,
      comment: {
        ...updatedComment,
        userVote: null,
      },
      message: "Comment updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error editing comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to edit comment" },
      { status: 500 }
    );
  }
}
