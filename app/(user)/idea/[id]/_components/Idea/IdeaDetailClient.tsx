"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import UserDetail from "../../UserDetail";
import EnhancedDescriptionDisplay from "./EnhancedDescriptionDisplay";
import VotesButton from "@/components/Shared/VotesButton";
import BackButton from "@/components/Shared/BackButton";
import { notFound } from "next/navigation";
import { useIdeaDetail } from "@/hooks/useIdeaDetail";
import { IdeaDetailSkeleton } from "./IdeaDetailSkeleton";

interface IdeaDetailClientProps {
  id: string;
}

export default function IdeaDetailClient({ id }: IdeaDetailClientProps) {
  const { data: idea, isLoading, isError, error } = useIdeaDetail(id);

  // Show skeleton while loading
  if (isLoading) {
    return <IdeaDetailSkeleton />;
  }

  // Show error state
  if (isError) {
    console.error("Error loading idea:", error);
    notFound();
  }

  // Show 404 if no idea found
  if (!idea) {
    notFound();
  }

  return (
    <div className=" bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left side: back + user/product */}
          <div className="flex items-center gap-3">
            <BackButton />

            <UserDetail
              username={idea.author.username}
              time={idea.createdAt}
              avatar={idea.author.image}
            />
          </div>

          {/* Right side: voting and options */}
          <div className="flex items-center gap-2">
            {/* votes */}
            <VotesButton
              id={idea.id}
              votesCount={idea.votesCount}
              userVoteType={idea.userVote}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted transition-colors"
              aria-label="More options"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          {/* Title */}
          <h1 className="text-3xl font-outfit font-semibold mb-6 leading-tight">
            {idea.title}
          </h1>

          {/* Description */}
          <div className="w-full">
            <EnhancedDescriptionDisplay
              content={idea.description as any}
              uploadedImages={idea.uploadedImages}
            />
          </div>
        </main>

        {/* <CommentForm ideaId={idea.id} /> */}

        {/* <CommentsSection ideaId={idea.id} /> */}
      </div>
    </div>
  );
}
