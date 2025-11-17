/**
 * Get Comments API Route
 * Cursor-based pagination for top-level comments with user votes
 */

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { CommentListResponse } from "@/types/comment";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get("ideaId");
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    // Validate ideaId
    if (!ideaId) {
      return NextResponse.json(
        { error: "Bad Request", message: "ideaId is required" },
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

    // Fetch comments with pagination
    const comments = await prisma.comments.findMany({
      where: {
        ideaId,
        commentId: null, // Only top-level comments
        OR :[
          {
            isDeleted: false,
          },
          {
            AND : [
              { isDeleted: true },
              { replies : { some: {} } }
            ]
          }
        ]
      },
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor
      }),
      orderBy: [
        { votesCount: "desc" }, // Popular first
        { createdAt: "desc" },  // Then newest
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

    // Determine if there are more comments
    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? commentsToReturn[commentsToReturn.length - 1].id : null;

    // Transform comments to include userVote
    const transformedComments = commentsToReturn.map((comment) => {
      const { votes, ...rest } = comment as any;
      return {
        ...rest,
        userVote: votes?.[0]?.type || null,
      };
    });

    const response: CommentListResponse = {
      comments: transformedComments,
      nextCursor,
      hasMore,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}