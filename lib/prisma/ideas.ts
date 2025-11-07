/**
 * Alternative server-side utility using Prisma instead of Supabase
 * Use this if you don't want to add foreign key constraints
 */

import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface IdeaWithAuthor {
  id: string;
  title: string;
  description: any;
  uploadedImages: string[];
  userId: string;
  votesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
  _count: {
    comments: number;
  };
  userVote?: {
    type: "UP" | "DOWN";
  } | null;
}

export interface IdeasResponse {
  ideas: IdeaWithAuthor[];
  nextCursor: string | null;
  hasMore: boolean;
}

const PAGE_SIZE = 10;

/**
 * Fetch paginated ideas using Prisma
 */
export const getIdeasWithPrisma = cache(
  async (cursor?: string, limit: number = PAGE_SIZE): Promise<IdeasResponse> => {
    // Get current user from Better Auth session
    const headersList = await headers();
    const session = await auth.api.getSession({ 
      headers: headersList as any 
    });
    const userId = session?.user?.id;

    // Build where clause for cursor pagination
    const where = cursor
      ? {
          createdAt: {
            lt: new Date(cursor),
          },
        }
      : {};

    // Fetch ideas with author and counts
    const ideas = await prisma.ideas.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
        votes: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                type: true,
              },
              take: 1,
            }
          : false,
      },
    });

    // Transform data to match interface
    const transformedIdeas = ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      uploadedImages: idea.uploadedImages,
      userId: idea.userId,
      votesCount: idea.votesCount,
      createdAt: idea.createdAt.toISOString(),
      updatedAt: idea.updatedAt.toISOString(),
      author: idea.author,
      _count: idea._count,
      userVote: idea.votes?.[0] || null,
    }));

    // Determine next cursor
    const hasMore = transformedIdeas.length === limit;
    const nextCursor = hasMore
      ? transformedIdeas[transformedIdeas.length - 1].createdAt
      : null;

    return {
      ideas: transformedIdeas,
      nextCursor,
      hasMore,
    };
  }
);
