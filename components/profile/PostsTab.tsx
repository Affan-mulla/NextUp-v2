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
import { MessageSquare, Loader2, ArrowBigUpDash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PostSkeleton } from "./PostSkeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Clock02Icon, Clock03Icon, Clock04Icon, Clock05Icon, Message02Icon } from "@hugeicons/core-free-icons";
import { timeAgo } from "@/lib/utils/time";

interface Post {
  id: string;
  title: string;
  description: any;
  votesCount: number;
  createdAt: string;
  uploadedImages: string[];
  _count: {
    comments: number;
  };
}

interface PostsResponse {
  posts: Post[];
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

  const response = await fetch(
    `/api/profile/${username}/posts?${params.toString()}`
  );
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export default function PostsTab({ username }: { username: string }) {
  const [sortBy, setSortBy] = useState("latest");

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
          <PostSkeleton key={i} />
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

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className=" flex gap-2 flex-col bg-background border-0">
            {posts.map((post) => (
              <Link key={post.id} href={`/idea/${post.id}`}>
                <div className="p-4 border shadow hover:bg-accent/50 transition-colors bg-accent/20 rounded-xl ">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Clock05Icon} size={18} />
                      <p>{timeAgo(post.createdAt)}</p>
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Message02Icon} size={18} />
                      {post._count.comments}
                    </span>
                    <span className="flex items-center">
                      <ArrowBigUpDash className="inline-block h-4 w-4 mr-1" />
                       {post.votesCount}</span>
                  </div>
                </div>
              </Link>
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
