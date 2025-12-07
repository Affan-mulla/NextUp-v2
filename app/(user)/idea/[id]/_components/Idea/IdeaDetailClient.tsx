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
import CommentForm from "../comment/CommentForm";
import CommentSection from "../comment/CommentSection";
import SaveIdea from "@/components/Shared/SaveIdea";
import CommentBox from "@/components/Shared/CommentBox";

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
      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-2 w-full">
        <BackButton />
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            {/* Left side: back + user/product */}
            <div className="">
              <UserDetail
                username={idea.author.username}
                time={idea.createdAt}
                avatar={idea.author.image}
              />
            </div>
          </div>

          {/* Main Content */}
          <main className="">
            {/* Title */}
            <h1 className="text-2xl font-outfit font-semibold tracking-wide ">
              {idea.title}
            </h1>

            {/* Description */}
            <div className="w-full">
              <EnhancedDescriptionDisplay
                content={idea.description as any}
                uploadedImages={idea.uploadedImages}
              />
            </div>

            {/* Bottom side: voting and options */}
            <div className="flex items-center gap-2 mt-6  ">
              {/* votes */}
              <VotesButton
                id={idea.id}
                votesCount={idea.votesCount}
                userVoteType={idea.userVote}
              />

              {/* Comments */}
              <CommentBox commentsCount={idea._count?.comments } />
              {/* save idea */}
              <SaveIdea />

            </div>
          </main>

          <CommentSection ideaId={idea.id} />
        </div>
      </div>
    </div>
  );
}
