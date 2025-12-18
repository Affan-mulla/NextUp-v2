"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { ProfilePost } from "@/types/profile";
import { useRouter } from "next/navigation";
import IdeaCard from "../feed/IdeaCard";
import { IdeaCardSkeleton } from "../feed/IdeaCardSkeleton";

interface PostsResponse {
  posts: ProfilePost[];
  nextCursor: string | null;
}

async function fetchPosts(
  username: string,
  cursor?: string,
  sortBy: string = "latest"
): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("sortBy", sortBy);
  params.set("limit", "10");

  const response = await axios.get(
    `/api/profile/${username}/posts?${params.toString()}`
  );
  if (response.status !== 200) throw new Error("Failed to fetch posts");
  return response.data;
}

export default function PostsTab({ username }: { username: string }) {
  const [sortBy, setSortBy] = useState("latest");
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["profile-posts", username, sortBy],
    queryFn: ({ pageParam }) => fetchPosts(username, pageParam, sortBy),
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
          <p className="text-muted-foreground">Failed to load posts</p>
        </CardContent>
      </Card>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

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

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className=" divide-border/50 divide-y p-1">
            {posts.map((post) => (
              <IdeaCard key={post.id} 
            id={post.id} 
            votesCount={post.votesCount}
            image={post.uploadedImages?.[0]}
            userVote={post.votes}
            avatar={post.author.image}
            username={post.author.username}
            title={post.title}
            createdAt={post.createdAt}
            commentsCount={post._count.comments}
               />
            ))}
          </div>

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
