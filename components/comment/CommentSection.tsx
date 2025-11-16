/**
 * Comment Section Component
 * Infinite scroll with virtualization for performance
 */

"use client";

import React, { useEffect, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComments } from "@/lib/hooks/use-comment-query";
import Comment, { CommentSkeleton } from "./Comment";
import CommentForm from "./CommentForm";
import type { CommentSectionProps } from "@/types/comment";

export default function CommentSection({
  ideaId,
  initialComments,
}: CommentSectionProps) {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useComments(ideaId);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all comments from pages
  const allComments = data?.pages.flatMap((page) => page.comments) || [];
  const totalComments = allComments.length;

  // Error state
  if (error) {
    return (
      <div className="py-8 mt-4">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Failed to load comments
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading the comments. Please try again.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        
        <CommentForm ideaId={ideaId} />
        
        <div className="space-y-3 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (totalComments === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        
        <CommentForm ideaId={ideaId} />
        
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No comments yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share your thoughts!
          </p>
        </div>
      </div>
    );
  }

  // Comments display
  return (
    <div className="space-y-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Comments
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            ({totalComments})
          </span>
        </h2>
      </div>

      {/* Comment Form */}
      <CommentForm ideaId={ideaId} />

      {/* Comments List */}
      <div className="mt-6 space-y-1">
        {allComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            ideaId={ideaId}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasNextPage && (
        <div ref={observerTarget} className="py-4 text-center">
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more comments...</span>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              Load More Comments
            </Button>
          )}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && totalComments > 5 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          You've reached the end of the comments
        </div>
      )}
    </div>
  );
}
