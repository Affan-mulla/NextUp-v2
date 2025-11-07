/**
 * IdeaCard Component
 * 
 * Displays an individual idea with voting, comments, and user info
 * 
 * Features:
 * - Per-idea pending state (only disables THIS card's buttons, not all cards)
 * - Optimistic voting with instant UI feedback
 * - Active states for voted buttons
 * - No interference between posts
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Comment03Icon } from "@hugeicons/core-free-icons";
import { ArrowBigDownDash, ArrowBigUpDash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useVoteIdea, useIsVotingIdea, type VoteType } from "@/hooks/useVoting";
import { useRouter } from "next/navigation";

// ============================================================================
// TypeScript Types
// ============================================================================

interface IdeaCardProps {
  id: string;
  title: string;
  image?: string;
  votesCount: number;
  commentsCount: number;
  avatar?: string;
  username: string;
  createdAt: string;
  userVote?: {
    type: VoteType;
  } | null;
}

// ============================================================================
// Component
// ============================================================================

const IdeaCard = ({
  id,
  title,
  image,
  votesCount,
  createdAt,
  commentsCount,
  avatar,
  username,
  userVote,
}: IdeaCardProps) => {
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
   * Format creation time
   */
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  /**
   * Determine vote states
   * isUpvoted: true if user has upvoted this idea
   * isDownvoted: true if user has downvoted this idea
   */
  const isUpvoted = userVote?.type === "UP";
  const isDownvoted = userVote?.type === "DOWN";

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

  const router = useRouter();

  return (
    <div className="">
      <Card className="bg-background py-3  border-border shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl hover:bg-card/20 cursor-pointer"
        onClick={() => {
          router.push(`/idea/${id}`);
        }}
      >
        {/* Header */}
        <CardHeader className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} />
            <AvatarFallback>{username.substring(0, 1).toLocaleUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <Link
              href={`/u/${username}`}
              onClick={(e)=> e.stopPropagation()}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              u/{username}
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex flex-col gap-3">
          <CardTitle className="font-outfit text-lg md:text-xl font-semibold">
            {title}
          </CardTitle>

          {image && (
            <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-xl">
              <Image
                src={image}
                alt={title}
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-between items-center">
          {/* Votes */}
          <CardAction className="flex items-center gap-2 bg-card p-2 rounded-md border border-border shadow">
            {/* Upvote Button */}
            <Button
              variant="secondary"
              size="icon-sm"
              
              onClick={(e) => {
                e.stopPropagation(); 
                handleVote("UP")
              }}
                disabled={isVoting}
              className={cn(
                "hover:text-green-500 border-t border-l  border-border rounded-md shadow box-border transition-colors",
                isUpvoted && "text-green-500 bg-green-500/10",
                isVoting && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowBigUpDash size={10} className="mr-px" />
            </Button>

            {/* Vote Count */}
            <span className="font-medium text-sm min-w-6 text-center">
              {votesCount}
            </span>

            {/* Downvote Button */}
            <Button
              variant="secondary"
              size="icon-sm"
              
              onClick={(e) => {
                e.stopPropagation();
                handleVote("DOWN");
              }}
              disabled={isVoting}
              className={cn(
                "hover:text-red-500 border-t border-l border-border rounded-md shadow box-border transition-colors",
                isDownvoted && "text-red-500 bg-red-500/10",
                isVoting && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowBigDownDash className="mr-px" size={10} />
            </Button>
          </CardAction>

          {/* Comments */}
          <CardAction className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-md">
            <HugeiconsIcon icon={Comment03Icon} className="size-4" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IdeaCard;
