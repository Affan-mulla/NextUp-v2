"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VoteSkeleton } from "./VoteSkeleton";

interface Vote {
  id: string;
  type: "UP" | "DOWN";
  createdAt: string;
  idea: {
    id: string;
    title: string;
    votesCount: number;
    author: {
      username: string;
      name: string;
      image: string | null;
    };
  };
}

interface VotesResponse {
  votes: Vote[];
  nextCursor: string | null;
}

async function fetchUpvotes(
  username: string,
  cursor?: string,
  sortBy: string = "latest"
): Promise<VotesResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("sortBy", sortBy);
  params.set("limit", "10");

  const response = await fetch(`/api/profile/${username}/upvotes?${params.toString()}`);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch upvotes");
  }
  return response.json();
}

export default function UpvotesTab({ username }: { username: string }) {
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
    queryKey: ["profile-upvotes", username, sortBy],
    queryFn: ({ pageParam }) => fetchUpvotes(username, pageParam, sortBy),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <VoteSkeleton key={i} />
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
              ? "You can only view your own upvotes"
              : "Failed to load upvotes"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const votes = data?.pages.flatMap((page) => page.votes) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
            <p className="text-muted-foreground">No upvotes yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {votes.map((vote) => (
            <Link key={vote.id} href={`/idea/${vote.idea.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={vote.idea.author.image || undefined} />
                      <AvatarFallback>
                        {vote.idea.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-2">
                        {vote.idea.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>by @{vote.idea.author.username}</span>
                        <span>↑ {vote.idea.votesCount}</span>
                        <span>{new Date(vote.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
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
        </>
      )}
    </div>
  );
}
