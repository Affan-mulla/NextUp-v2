"use client";
import { ArrowBigDownDash, ArrowBigUpDash } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useIsVotingIdea, useVoteIdea, VoteType } from "@/hooks/useVoting";
import { UserVoteType } from "@/types/VoteType";
import { useEffect } from "react";

const VotesButton = ({
  id,
  votesCount,
  userVoteTypeProps,
}: {
  id: string;
  votesCount: number;
  userVoteTypeProps?: UserVoteType;
}) => {
  /**
   * Get vote mutation from React Query
   * mutate: Function to trigger vote
   */
  const { mutate: vote } = useVoteIdea();

  /**
   * Per-idea pending state using mutation cache
   * Only true when THIS specific idea is being voted on
   * Prevents disabling buttons on unrelated posts
   */
  const isVoting = useIsVotingIdea(id);

  /**
   * Normalize userVote to handle both object and string formats
   * Ensures we always work with simple "UP" | "DOWN" | null
   */

  const normalizedUserVote: VoteType | null = 
    typeof userVoteTypeProps === 'object' && userVoteTypeProps !== null && 'type' in userVoteTypeProps
      ? (userVoteTypeProps as any).type
      : (userVoteTypeProps as VoteType | null | undefined) ?? null;

  /**
   * Determine vote states
   * isUpvoted: true if user has upvoted this idea
   * isDownvoted: true if user has downvoted this idea
   */
  const isUpvoted = normalizedUserVote === "UP";
  const isDownvoted = normalizedUserVote === "DOWN";

  /**
   * Handle vote button click
   *
   * Flow:
   * 1. Check if already voting (prevent double-click)
   * 2. Call vote mutation (triggers optimistic update in useVoteIdea)
   * 3. UI updates instantly via optimistic cache update
   *
   * @param voteType - "UP" or "DOWN"
   */
  const handleVote = (voteType: VoteType) => {
    // Prevent multiple simultaneous votes on same idea
    if (isVoting) return;

    // Trigger vote mutation with optimistic update
    vote({ ideaId: id, voteType });
  };

  return (
    <div className="flex w-fit items-center bg-popover/90 hover:border-primary transition-colors border border-border rounded-md gap-0.5">
      {/* Upvote Button */}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          handleVote("UP");
        }}
        disabled={isVoting}
        className={cn(
          "hover:text-green-500 text-muted-foreground hover:backdrop-blur-2xl z-20 transition-colors",
          isVoting && "opacity-50 cursor-not-allowed",
          isUpvoted && "text-green-500"
        )}
      >
        <ArrowBigUpDash
          size={10}
          className={cn(
            "transition-all",
            isUpvoted && "fill-current text-green-500"
          )}
        />
      </Button>

      {/* Vote Count */}
      <span className="font-medium text-sm min-w-6 text-center">
        {votesCount}
      </span>

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          handleVote("DOWN");
        }}
        disabled={isVoting}
        className={cn(
          "hover:text-red-500 text-muted-foreground transition-colors",
          isVoting && "opacity-50 cursor-not-allowed",
          isDownvoted && "text-red-500"
        )}
      >
        <ArrowBigDownDash
          size={10}
          className={cn(
            "transition-all",
            isDownvoted && "fill-current text-red-500"
          )}
        />
      </Button>
    </div>
  );
};

export default VotesButton;
