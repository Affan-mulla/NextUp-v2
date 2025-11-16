/**
 * Comment Component
 * Memoized comment with lazy-loaded replies and depth limiting
 */

"use client";

import React, { useState, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useReplies } from "@/lib/hooks/use-comment-query";
import CommentForm from "./CommentForm";
import VotesButton from "./VotesButton";
import type { CommentProps } from "@/types/comment";
import { Message01Icon, MessageMultiple01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function ThreadGutter({ depth ,hasReplies}: { depth: number, hasReplies?: boolean }) {
  return (
    <div className={cn("absolute inset-y-2  flex", depth === 0 ? "-left-1" : "left-6", !hasReplies && "block"  )}>
       {
        (!hasReplies && depth !== 0  ) && (
         <div className=" h-4 w-10 border-l border-border border-b-2 rounded-b-xl  absolute -left-10 top-1" />
        )
      }
        <div
          className="w-4 flex justify-center"
          style={{ marginLeft: depth !== 0 ? 0 : 12 }}
        >
          <div className="w-px bg-border" />
        </div>

    </div>
  );
}


const MAX_NESTED_DEPTH = 5; // Limit reply nesting to prevent infinite recursion

function CommentComponent({
  comment,
  ideaId,
  depth = 0,
  maxDepth = MAX_NESTED_DEPTH,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const hasReplies = comment._count.replies > 0;
  const canNest = depth < maxDepth;

  // Lazy load replies only when requested
  const {
    data: repliesData,
    isLoading: repliesLoading,
    error: repliesError,
  } = useReplies(comment.id, showReplies && hasReplies);

  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const toggleReplyForm = () => {
    setIsReplying((prev) => !prev);
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div
      className={cn(
        " relative border-b border-border/50 py-3",
        depth > 0 && "ml-8  pl-4 "
      )}
    >
       <ThreadGutter depth={depth} hasReplies={hasReplies} />
     
      {/* Comment Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.user.image ? (
            <AvatarImage
              src={comment.user.image}
              alt={comment.user.username}
              className="object-cover"
            />
          ) : (
            <AvatarFallback>
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {comment.user.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Comment Content */}
          <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap wrap-break-word">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <VotesButton
              commentId={comment.id}
              ideaId={ideaId}
              initialVotesCount={comment.votesCount}
              initialUserVote={comment.userVote}
              size="sm"
            />

            {canNest && (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                onClick={toggleReplyForm}
              >
                <HugeiconsIcon icon={Message01Icon} size={"20px"} strokeWidth={1.5} />
                Reply
              </Button>
            )}

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                onClick={toggleReplies}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {comment._count.replies}{" "}
                    {comment._count.replies === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {comment._count.replies}{" "}
                    {comment._count.replies === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && canNest && (
        <div className="mt-3">
          <CommentForm
            setIsOpen={setIsReplying}
            ideaId={ideaId}
            parentId={comment.id}
            onSuccess={handleReplySuccess}
            autoFocus
          />
        </div>
      )}

      {/* Replies */}
      {showReplies && hasReplies && (
        <div className="mt-3">
          {repliesLoading && (
            <div className="space-y-3">
              {Array.from({ length: Math.min(3, comment._count.replies) }).map(
                (_, i) => (
                  <CommentSkeleton key={i} depth={depth + 1} />
                )
              )}
            </div>
          )}

          {repliesError && (
            <div className="text-sm text-red-500 p-2">
              Failed to load replies. Please try again.
            </div>
          )}

          {repliesData?.replies && repliesData.replies.length > 0 && (
            <div className="space-y-2">
              {repliesData.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  ideaId={ideaId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Skeleton Loader
function CommentSkeleton({ depth = 0 }: { depth?: number }) {
  return (
    <div
      className={cn(
        "border-b border-border/50 py-3",
        depth > 0 && "ml-8 border-l-2 border-border/30 pl-4"
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoized export to prevent unnecessary re-renders
const Comment = memo(CommentComponent, (prevProps, nextProps) => {
  return (
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.votesCount === nextProps.comment.votesCount &&
    prevProps.comment.userVote === nextProps.comment.userVote &&
    prevProps.comment._count.replies === nextProps.comment._count.replies &&
    prevProps.depth === nextProps.depth
  );
});

Comment.displayName = "Comment";

export default Comment;
export { CommentSkeleton };
