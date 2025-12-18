/**
 * React Query hooks for voting system with optimistic updates
 *
 * CRITICAL: This implementation fixes UI rollback issues by:
 * 1. Using setQueriesData (plural) instead of setQueryData to update ALL query instances
 * 2. Capturing snapshots of ALL queries for proper rollback
 * 3. Writing server-confirmed data to cache in onSuccess to prevent stale data
 * 4. Using mutationKey for per-idea pending state detection
 *
 * Architecture:
 * - Optimistic updates: UI changes immediately before server response
 * - Multi-query support: Updates all cached "ideas" queries (handles infinite scroll)
 * - Atomic rollback: Reverts ALL queries if mutation fails
 * - Server reconciliation: onSuccess writes confirmed data to cache
 *
 * Performance:
 * - Only updates the specific idea being voted on (no interference between posts)
 * - Per-idea pending state prevents unnecessary re-renders
 * - Background revalidation ensures eventual consistency
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Vote type enum matching Prisma schema
 */
export type VoteType = "UP" | "DOWN";

/**
 * Vote mutation payload
 */
export interface VoteMutationData {
  ideaId: string;
  voteType: VoteType;
}

/**
 * Server response after voting (must match cache structure exactly)
 */
export interface VoteResponse {
  success: boolean;
  votesCount: number;
  userVote: VoteType | null;
}

/**
 * Idea data structure (subset needed for voting)
 */
export interface IdeaVoteData {
  id: string;
  votesCount: number;
  userVote?:  VoteType | null ;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Submit vote to API endpoint
 *
 * @param ideaId - The ID of the idea being voted on
 * @param voteType - "UP" for upvote, "DOWN" for downvote
 * @returns Server response with updated vote count and user vote status
 */
async function submitVote({
  ideaId,
  voteType,
}: VoteMutationData): Promise<VoteResponse> {
  const { data } = await axios.post(
    "/api/ideas/vote",
    { ideaId, voteType },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Normalize userVote to VoteType | null (handle both {type: "UP"} and "UP" formats)
  let normalizedUserVote: VoteType | null = null;
  if (data.userVote) {
    // If userVote is an object with 'type' property, extract it
    normalizedUserVote = typeof data.userVote === 'object' && 'type' in data.userVote 
      ? data.userVote.type 
      : data.userVote;
  }

  return {
    success: data.success,
    votesCount: data.votesCount,
    userVote: normalizedUserVote,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate new vote state based on current state and action
 * Returns updated votesCount and userVote
 *
 * Logic:
 * - Same vote clicked = Remove vote (toggle off)
 * - Different vote clicked = Switch vote (UP ↔ DOWN)
 * - No previous vote = Add new vote
 */
function calculateVoteUpdate(
  currentVotesCount: number,
  currentUserVote: VoteType  | null | undefined,
  newVoteType: VoteType
): { votesCount: number; userVote: VoteType | null } {
  const currentVote = currentUserVote;

  // Case 1: Removing vote (clicked same button)
  if (currentVote === newVoteType) {
    return {
      votesCount: currentVotesCount + (newVoteType === "UP" ? -1 : 1),
      userVote: null,
    };
  }

  // Case 2: Switching vote (UP ↔ DOWN)
  if (currentVote) {
    return {
      votesCount: currentVotesCount + (newVoteType === "UP" ? 2 : -2),
      userVote: newVoteType,
    };
  }

  // Case 3: Adding new vote
  return {
    votesCount: currentVotesCount + (newVoteType === "UP" ? 1 : -1),
    userVote: newVoteType,
  };
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook for voting on ideas with optimistic updates
 *
 * CRITICAL FIX: Uses setQueriesData/getQueriesData (plural) to handle ALL query instances
 * This prevents UI rollback when infinite scroll creates multiple query caches
 *
 * Flow:
 * 1. onMutate: Cancel queries → Snapshot ALL queries → Update ALL queries optimistically
 * 2. mutationFn: Send request to server
 * 3. onSuccess: Write server data to ALL queries (prevents stale data)
 * 4. onError: Restore ALL queries from snapshot (atomic rollback)
 * 5. onSettled: Invalidate queries for background revalidation
 *
 * @returns Mutation object with { mutate, isPending, etc. }
 *
 * @example
 * const { mutate: vote, isPending } = useVoteIdea();
 * vote({ ideaId: "abc123", voteType: "UP" });
 */
export function useVoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    // Mutation key enables per-idea pending state detection
    mutationKey: ["vote-idea"],

    mutationFn: submitVote,

    /**
     * onMutate: Runs BEFORE server request
     *
     * CRITICAL: Uses getQueriesData/setQueriesData (plural) to update ALL queries
     * This is essential for infinite scroll where multiple query instances exist
     *
     * Steps:
     * 1. Cancel outgoing queries to prevent race conditions
     * 2. Snapshot ALL "ideas" queries for rollback
     * 3. Optimistically update ALL queries
     * 4. Return snapshots for rollback in onError
     */
    onMutate: async ({ ideaId, voteType }) => {
      // Cancel all outgoing queries to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["ideas"] });
      await queryClient.cancelQueries({ 
        predicate: (query) => query.queryKey[0] === "profile-posts" 
      });

      // Snapshot ALL queries matching ["ideas"] - critical for infinite scroll
      // getQueriesData returns array of [queryKey, data] tuples for ALL matching queries
      const previousIdeasQueries = queryClient.getQueriesData<{
        pages: Array<{
          ideas: IdeaVoteData[];
          nextCursor: string | null;
          hasMore: boolean;
        }>;
        pageParams: (string | undefined)[];
      }>({ queryKey: ["ideas"] });

      // Snapshot profile-posts queries
      const previousProfileQueries = queryClient.getQueriesData<{
        pages: Array<{
          posts: IdeaVoteData[];
          nextCursor: string | null;
        }>;
        pageParams: (string | undefined)[];
      }>({ 
        predicate: (query) => query.queryKey[0] === "profile-posts" 
      });

      // Optimistically update ALL "ideas" queries
      queryClient.setQueriesData<{
        pages: Array<{
          ideas: IdeaVoteData[];
          nextCursor: string | null;
          hasMore: boolean;
        }>;
        pageParams: (string | undefined)[];
      }>({ queryKey: ["ideas"] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            ideas: page.ideas.map((idea) => {
              if (idea.id !== ideaId) return idea;

              const { votesCount, userVote } = calculateVoteUpdate(
                idea.votesCount,
                idea.userVote,
                voteType
              );

              return { ...idea, votesCount, userVote };
            }),
          })),
        };
      });

      // Optimistically update ALL "profile-posts" queries
      // Note: Profile posts use 'votes' field instead of 'userVote'
      queryClient.setQueriesData<{
        pages: Array<{
          posts: Array<{
            id: string;
            votesCount: number;
            votes?: VoteType | null;
            [key: string]: any;
          }>;
          nextCursor: string | null;
        }>;
        pageParams: (string | undefined)[];
      }>({ 
        predicate: (query) => query.queryKey[0] === "profile-posts" 
      }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.id !== ideaId) return post;

              const { votesCount, userVote } = calculateVoteUpdate(
                post.votesCount,
                post.votes,
                voteType
              );

              // Use 'votes' field for profile posts
              return { ...post, votesCount, votes: userVote };
            }),
          })),
        };
      });

      // Return snapshots of ALL queries for rollback
      return { 
        previousIdeasQueries, 
        previousProfileQueries 
      };
    },

    /**
     * onSuccess: Runs after successful server response
     *
     * CRITICAL FIX: Write server data to cache to prevent stale data
     * Don't rely solely on invalidateQueries - it's async and can cause rollback
     */
    onSuccess: (serverData, { ideaId }) => {
      // Write server-confirmed data to ALL "ideas" queries
      queryClient.setQueriesData<{
        pages: Array<{
          ideas: IdeaVoteData[];
          nextCursor: string | null;
          hasMore: boolean;
        }>;
        pageParams: (string | undefined)[];
      }>({ queryKey: ["ideas"] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            ideas: page.ideas.map((idea) => {
              if (idea.id !== ideaId) return idea;
              return {
                ...idea,
                votesCount: serverData.votesCount,
                userVote: serverData.userVote,
              };
            }),
          })),
        };
      });

      // Write server-confirmed data to ALL "profile-posts" queries
      // Note: Profile posts use 'votes' field instead of 'userVote'
      queryClient.setQueriesData<{
        pages: Array<{
          posts: Array<{
            id: string;
            votesCount: number;
            votes?: VoteType | null;
            [key: string]: any;
          }>;
          nextCursor: string | null;
        }>;
        pageParams: (string | undefined)[];
      }>({ 
        predicate: (query) => query.queryKey[0] === "profile-posts" 
      }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.id !== ideaId) return post;
              // Use 'votes' field for profile posts
              return {
                ...post,
                votesCount: serverData.votesCount,
                votes: serverData.userVote,
              };
            }),
          })),
        };
      });
    },

    /**
     * onError: Runs if mutation fails
     *
     * CRITICAL: Restore ALL queries from snapshot (atomic rollback)
     */
    onError: (_error, _variables, context) => {
      // Rollback ALL queries to their pre-mutation state
      if (context?.previousIdeasQueries) {
        context.previousIdeasQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProfileQueries) {
        context.previousProfileQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    /**
     * onSettled: Runs after mutation completes (success or error)
     *
     * Invalidate queries for background revalidation
     * This ensures eventual consistency without blocking UI
     */
    onSettled: () => {
      // Invalidate both ideas and profile-posts queries for background revalidation
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "ideas" || q.queryKey[0] === "profile-posts",
        refetchType: "inactive",
      });
    },
  });
}

/**
 * Hook to check if a specific idea is currently being voted on
 *
 * Used for per-idea pending state (disables only the voted idea's buttons)
 * Prevents re-renders across unrelated posts
 *
 * @param ideaId - The ID of the idea to check
 * @returns boolean indicating if this specific idea has a pending vote mutation
 */
export function useIsVotingIdea(ideaId: string): boolean {
  const queryClient = useQueryClient();

  // Find all pending vote mutations
  const mutations = queryClient.getMutationCache().findAll({
    mutationKey: ["vote-idea"],
    predicate: (mutation) => mutation.state.status === "pending",
  });

  // Check if any mutation is for this specific idea
  return mutations.some((mutation) => {
    const variables = mutation.state.variables as VoteMutationData | undefined;
    return variables?.ideaId === ideaId;
  });
}
