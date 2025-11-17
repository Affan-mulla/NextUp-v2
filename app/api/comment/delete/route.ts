/**
 * Delete Comment API Route
 * Soft deletes comment by setting isDeleted=true and content to "[deleted]"
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { DeleteCommentRequest, DeleteCommentResponse } from "@/types/comment";

export async function DELETE(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to delete comments" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: DeleteCommentRequest = await request.json();
    const { commentId } = body;

    // Validate commentId
    if (!commentId) {
      return NextResponse.json(
        { error: "Bad Request", message: "Comment ID is required" },
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
        { error: "Forbidden", message: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    if (existingComment.isDeleted) {
      return NextResponse.json(
        { error: "Bad Request", message: "Comment already deleted" },
        { status: 400 }
      );
    }

    // Soft delete: update isDeleted and content
    await prisma.comments.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        content: "[deleted]",
      },
    });

    const response: DeleteCommentResponse = {
      success: true,
      message: "Comment deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
