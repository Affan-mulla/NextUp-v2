/**
 * Client component for rendering Ideas feed with infinite scroll
 * Integrates with React Query for data fetching
 * 
 * Architecture:
 * - Uses useIdeas hook for infinite scroll pagination
 * - Each IdeaCard manages its own voting state (isolated)
 * - Intersection Observer for automatic "load more" trigger
 */

"use client";

import { useIdeas } from "@/hooks/useIdeas";
import IdeaCard from "./IdeaCard";
import { IdeaFeedSkeleton } from "./IdeaCardSkeleton";
import { ErrorState, EmptyState } from "./ErrorState";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { IdeaWithAuthor } from "@/lib/supabase/ideas";

const IdeaWrapper = () => {

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useIdeas();

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading state
  if (isLoading) {
   
    return (
      <div className="grid grid-cols-1 gap-4">
        <IdeaFeedSkeleton count={5} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  // Get all ideas from all pages
  const allIdeas = data?.pages.flatMap((page: any) => page.ideas) || [];

  // Empty state
  if (allIdeas.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 
        Render each idea card with isolated voting state
        Each card manages its own optimistic updates
        userVote prop enables showing active vote state
      */}
      {allIdeas.map((idea: IdeaWithAuthor) => (
        <IdeaCard
          key={idea.id}
          id={idea.id}
          title={idea.title}
          image={idea.uploadedImages[0]}
          votesCount={idea.votesCount}
          commentsCount={idea._count.comments}
          avatar={idea.author.image || undefined}
          username={idea.author.username}
          createdAt={idea.createdAt}
          userVote={idea.userVote}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <Button disabled variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading more...
            </Button>
          ) : (
            <Button onClick={() => fetchNextPage()} variant="outline">
              Load more
            </Button>
          )}
        </div>
      )}

      {/* End of feed message */}
      {!hasNextPage && allIdeas.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          You've reached the end! 🎉
        </div>
      )}
    </div>
  );
};

export default IdeaWrapper;