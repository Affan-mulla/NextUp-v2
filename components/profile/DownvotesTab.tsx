"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { VoteSkeleton } from "./VoteSkeleton";
import IdeaCard from "../feed/IdeaCard";
import { ProfileVote } from "@/types/profile";
import { IdeaCardSkeleton } from "../feed/IdeaCardSkeleton";

interface VotesResponse {
  votes: ProfileVote[];
  nextCursor: string | null;
}

async function fetchDownvotes(
  username: string,
  cursor?: string,
  sortBy: string = "latest"
): Promise<VotesResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("sortBy", sortBy);
  params.set("limit", "10");

  const response = await fetch(`/api/profile/${username}/downvotes?${params.toString()}`);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch downvotes");
  }
  return response.json();
}

export default function DownvotesTab({ username }: { username: string }) {
  const [sortBy, setSortBy] = useState("latest");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["profile-downvotes", username, sortBy],
    queryFn: ({ pageParam }) => fetchDownvotes(username, pageParam, sortBy),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <IdeaCardSkeleton key={i} img={i % 2 !== 0} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {error instanceof Error && error.message === "Unauthorized"
              ? "You can only view your own downvotes"
              : "Failed to load downvotes"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const votes = data?.pages.flatMap((page) => page.votes) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mr-4 sm:mr-0">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="top">Top</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {votes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No downvotes yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col divide-y">
          {votes.map((vote) => (
           <IdeaCard key={vote.id} 
            id={vote.idea.id} 
            votesCount={vote.idea.votesCount}
            image={vote.idea.uploadedImages?.[0]}
            userVote={vote.type}
            avatar={vote.idea.author.image}
            username={vote.idea.author.username}
            title={vote.idea.title}
            createdAt={vote.createdAt}
            commentsCount={vote.idea._count.comments}
               />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
