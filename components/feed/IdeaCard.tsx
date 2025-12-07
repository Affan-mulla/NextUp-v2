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
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark01Icon, Bookmark02Icon, Comment03Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {  type VoteType } from "@/hooks/useVoting";
import { useRouter } from "next/navigation";
import VotesButton from "../Shared/VotesButton";
import { Button } from "../ui/button";
import CommentBox from "../Shared/CommentBox";

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
   * Format creation time
   */
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });


  

  const router = useRouter();

  return (
    <div className="">
      <Card className="bg-background py-3 gap-4 border-0 rounded-none transition-colors duration-200 dark:hover:bg-secondary/20 hover:bg-secondary  cursor-pointer"
        onClick={() => {  
          router.push(`/idea/${id}`);
        }}
      >
        {/* Header */}
        <CardHeader className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
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
        <CardContent className="flex flex-col gap-2">
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
        <CardFooter className="flex items-center gap-2 h-8">
          {/* Votes */}
         <VotesButton id={id} votesCount={votesCount} userVoteType={userVote} />

          {/* Comments */}
          <CommentBox commentsCount={commentsCount} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default IdeaCard;
