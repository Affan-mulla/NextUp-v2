/**
 * Comment Component
 * Memoized comment with lazy-loaded replies and depth limiting
 */

"use client";

import React, { useState, memo, Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useReplies, useEditComment } from "@/lib/hooks/use-comment-query";
import CommentForm from "./CommentForm";
import VotesButton from "./VotesButton";
import type { CommentProps } from "@/types/comment";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CommentAction from "./CommentAction";
import { useUserField } from "@/lib/store/user-store";
import { toast } from "sonner";
import Link from "next/link";

function ThreadGutter({ depth ,hasReplies }: { depth: number, hasReplies?: boolean }) {
  return (
    <div className={cn("absolute inset-y-3  flex", depth === 0 ? "-left-1" : "left-6", !hasReplies && "block",    )}>
       {
        ( depth !== 0  ) && (
         <div className=" h-4 w-10 border-l border-border border-b-2 rounded-bl-xl  absolute -left-10 top-1" />
        )
      }
        <div
          className="w-4 flex justify-center"
          style={{ marginLeft: depth !== 0 ? 0 : 12 }}
        >
          <div className={cn("w-px bg-border") } />
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const userId = useUserField("id");

  const hasReplies = comment._count.replies > 0;
  const canNest = depth < maxDepth;
  const isDeleted = comment.isDeleted;
  const isOwner = userId === comment.userId;

  // Edit mutation
  const { mutate: editComment, isPending: isEditPending } = useEditComment(ideaId);

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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (trimmedContent === comment.content) {
      setIsEditing(false);
      return;
    }

    if (trimmedContent.length > 2000) {
      toast.error("Comment cannot exceed 2000 characters");
      return;
    }

    editComment(
      { commentId: comment.id, content: trimmedContent },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div
      className={cn(
        " relative py-3",
        depth > 0 && "ml-8  pl-4 ",
        depth == 0 && "border-b border-border py-3"
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
            <Link href={`/u/${comment.user.username}`}>
            <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {comment.user.username}
            </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-none"
                placeholder="Edit your comment..."
                autoFocus
                disabled={isEditPending}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {editContent.length}/2000
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isEditPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isEditPending || !editContent.trim()}
                  >
                    {isEditPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className={cn(
              "text-sm mt-1 whitespace-pre-wrap wrap-break-word",
              isDeleted ? "text-muted-foreground italic" : "text-foreground/90"
            )}>
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing  && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <VotesButton
                commentId={comment.id}
                ideaId={ideaId}
                initialVotesCount={comment.votesCount}
                initialUserVote={comment.userVote}
                size="sm"
                disabled={isDeleted}
                
              />

              {canNest && !isDeleted && (
                <Button
                  variant="ghost"
                  className=" h-7 px-2 text-xs"
                  onClick={toggleReplyForm}
                >
                  <HugeiconsIcon icon={Message01Icon} className="size-4 text-muted-foreground"  />
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

              {isOwner && !isDeleted && (
                <CommentAction 
                  commentId={comment.id} 
                  ideaId={ideaId} 
                  onEditClick={handleEditClick}
                />
              )}
            </div>
          )}
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
        depth > 0 && "ml-8 pl-4"
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
    prevProps.comment.content === nextProps.comment.content &&
    prevProps.comment.isDeleted === nextProps.comment.isDeleted &&
    prevProps.depth === nextProps.depth
  );
});

Comment.displayName = "Comment";

export default Comment;
export { CommentSkeleton };
