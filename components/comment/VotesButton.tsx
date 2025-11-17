/**
 * Votes Button Component
 * Debounced voting with optimistic updates
 */

"use client";

import { useState, useCallback } from "react";
import { ArrowBigUpDash, ArrowBigDownDash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoteType } from "@prisma/client";
import { useVoteComment } from "@/lib/hooks/use-comment-query";
import type { VotesButtonProps } from "@/types/comment";

// Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    }) as T,
    [callback, delay, timeoutId]
  );
}

export default function VotesButton({
  commentId,
  ideaId,
  initialVotesCount,
  initialUserVote,
  size = "md",
  disabled = false,
}: VotesButtonProps) {
  const [localVote, setLocalVote] = useState<VoteType | null>(
    initialUserVote || null
  );
  const [localCount, setLocalCount] = useState(initialVotesCount);

  const voteCommentMutation = useVoteComment(ideaId);

  const handleVoteClick = useCallback(
    (voteType: VoteType) => {
      if (disabled) return;
      // Determine new vote state
      const newVote = localVote === voteType ? null : voteType;
      
      // Calculate delta for optimistic UI
      let delta = 0;
      if (localVote === null && newVote === "UP") delta = 1;
      else if (localVote === null && newVote === "DOWN") delta = -1;
      else if (localVote === "UP" && newVote === null) delta = -1;
      else if (localVote === "DOWN" && newVote === null) delta = 1;
      else if (localVote === "UP" && newVote === "DOWN") delta = -2;
      else if (localVote === "DOWN" && newVote === "UP") delta = 2;

      // Optimistic local state update
      setLocalVote(newVote);
      setLocalCount((prev) => prev + delta);

      // Call mutation
      voteCommentMutation.mutate(
        {
          commentId,
          voteType: newVote,
        },
        {
          onError: () => {
            // Rollback on error
            setLocalVote(localVote);
            setLocalCount(localCount);
          },
        }
      );
    },
    [commentId, localVote, localCount, voteCommentMutation, disabled]
  );

  // Debounced version (optional, for network optimization)
  const debouncedVote = useDebounce(handleVoteClick, 300);

  const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size={size === "sm" ? "icon-sm" : "icon-sm"}
        className={cn(
          "text-muted-foreground transition-colors",
          localVote === "UP"
            ? "text-green-600 hover:text-green-700"
            : "hover:text-green-600"
        )}
        onClick={() => handleVoteClick("UP")}
        disabled={voteCommentMutation.isPending || disabled}
        aria-label="Upvote"
      >
        <ArrowBigUpDash
          size={iconSize}
          className={cn(
            "transition-all",
            localVote === "UP" && "fill-current"
          )}
        />
      </Button>

      <span
        className={cn(
          "text-sm font-medium min-w-[2ch] text-center transition-colors",
          localVote === "UP" && "text-green-600",
          localVote === "DOWN" && "text-orange-600"
        )}
      >
        {localCount}
      </span>

      <Button
        variant="ghost"
        size={size === "sm" ? "icon-sm" : "icon-sm"}
        className={cn(
          "text-muted-foreground transition-colors",
          localVote === "DOWN"
            ? "text-orange-600 hover:text-orange-700"
            : "hover:text-orange-600"
        )}
        onClick={() => handleVoteClick("DOWN")}
        disabled={voteCommentMutation.isPending || disabled}
        aria-label="Downvote"
      >
        <ArrowBigDownDash
          size={iconSize}
          className={cn(
            "transition-all",
            localVote === "DOWN" && "fill-current"
          )}
        />
      </Button>
    </div>
  );
}
