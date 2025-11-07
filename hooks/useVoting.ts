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
  userVote: {
    type: VoteType;
  } | null;
}

/**
 * Idea data structure (subset needed for voting)
 */
export interface IdeaVoteData {
  id: string;
  votesCount: number;
  userVote?: {
    type: VoteType;
  } | null;
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
  const { data } = await axios.post<VoteResponse>(
    "/api/ideas/vote",
    { ideaId, voteType },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return data;
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
  currentUserVote: { type: VoteType } | null | undefined,
  newVoteType: VoteType
): { votesCount: number; userVote: { type: VoteType } | null } {
  const currentVote = currentUserVote?.type;

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
      userVote: { type: newVoteType },
    };
  }

  // Case 3: Adding new vote
  return {
    votesCount: currentVotesCount + (newVoteType === "UP" ? 1 : -1),
    userVote: { type: newVoteType },
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
      // Cancel all outgoing "ideas" queries to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["ideas"] });

      // Snapshot ALL queries matching ["ideas"] - critical for infinite scroll
      // getQueriesData returns array of [queryKey, data] tuples for ALL matching queries
      const previousQueries = queryClient.getQueriesData<{
        pages: Array<{
          ideas: IdeaVoteData[];
          nextCursor: string | null;
          hasMore: boolean;
        }>;
        pageParams: (string | undefined)[];
      }>({ queryKey: ["ideas"] });

      // Optimistically update ALL queries
      // setQueriesData updates every query matching ["ideas"]
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
              // Only update the specific idea being voted on
              if (idea.id !== ideaId) return idea;

              // Calculate new vote state
              const { votesCount, userVote } = calculateVoteUpdate(
                idea.votesCount,
                idea.userVote,
                voteType
              );

              return {
                ...idea,
                votesCount,
                userVote,
              };
            }),
          })),
        };
      });

      // Return snapshot of ALL queries for rollback
      return { previousQueries };
    },

    /**
     * onSuccess: Runs after successful server response
     *
     * CRITICAL FIX: Write server data to cache to prevent stale data
     * Don't rely solely on invalidateQueries - it's async and can cause rollback
     */
    onSuccess: (serverData, { ideaId }) => {
      // Write server-confirmed data to ALL queries
      // This ensures cache matches server state exactly
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

              // Update with server-confirmed data
              return {
                ...idea,
                votesCount: serverData.votesCount,
                userVote: serverData.userVote,
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
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
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
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "ideas",
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
