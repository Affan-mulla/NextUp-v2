/**
 * Server-side utility functions for fetching Ideas from Supabase
 * Optimized for performance with minimal field selection
 * Uses Better Auth for authentication
 */

import { createClient } from "@/utils/supabase/server";
import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export interface IdeaWithAuthor {
  id: string;
  title: string;
  description: any; // JSON field
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
 * Fetch paginated ideas with author info and vote counts
 * Cached for optimal performance in server components
 */
export const getIdeas = cache(
  async (cursor?: string, limit: number = PAGE_SIZE): Promise<IdeasResponse> => {
    const supabase = await createClient();

    // Get current user from Better Auth session
    const headersList = await headers();
    const session = await auth.api.getSession({ 
      headers: headersList as any 
    });
    const userId = session?.user?.id;

    // Build query with pagination
    let query = supabase
      .from("Ideas")
      .select(
        `
        id,
        title,
        description,
        uploadedImages,
        userId,
        votesCount,
        createdAt,
        updatedAt,
        author:user!userId(
          id,
          username,
          name,
          image
        )
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false })
      .limit(limit);

    // Apply cursor pagination if provided
    if (cursor) {
      query = query.lt("createdAt", cursor);
    }

    const { data: ideas, error } = await query;

    if (error) {
      console.error("Error fetching ideas:", error);
      throw new Error("Failed to fetch ideas");
    }

    // Get comment counts for each idea
    const ideasWithCounts = await Promise.all(
      (ideas || []).map(async (idea) => {
        // Get comment count
        const { count: commentCount } = await supabase
          .from("Comments")
          .select("id", { count: "exact", head: true })
          .eq("ideaId", idea.id);

        // Get user's vote if authenticated
        let userVote = null;
        if (userId) {
          const { data: vote } = await supabase
            .from("Votes")
            .select("type")
            .eq("userId", userId)
            .eq("ideaId", idea.id)
            .maybeSingle();

          userVote = vote;
        }

        // Ensure author is a single object, not an array
        const author = Array.isArray(idea.author) ? idea.author[0] : idea.author;

        return {
          ...idea,
          author,
          _count: {
            comments: commentCount || 0,
          },
          userVote,
        };
      })
    );

    // Determine next cursor and if there are more items
    const hasMore = ideasWithCounts.length === limit;
    const nextCursor = hasMore
      ? ideasWithCounts[ideasWithCounts.length - 1].createdAt
      : null;

    return {
      ideas: ideasWithCounts as IdeaWithAuthor[],
      nextCursor,
      hasMore,
    };
  }
);

/**
 * Get a single idea by ID with full details
 */
export const getIdeaById = cache(async (id: string) => {
  const supabase = await createClient();

  const { data: idea, error } = await supabase
    .from("Ideas")
    .select(
      `
      id,
      title,
      description,
      uploadedImages,
      userId,
      votesCount,
      createdAt,
      updatedAt,
      author:User!Ideas_userId_fkey(
        id,
        username,
        name,
        image
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching idea:", error);
    throw new Error("Failed to fetch idea");
  }

  return idea;
});
