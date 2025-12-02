"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommentSkeleton } from "./CommentSkeleton";

interface Comment {
  id: string;
  content: string;
  votesCount: number;
  createdAt: string;
  idea: {
    id: string;
    title: string;
  } | null;
  post: {
    id: string;
    title: string;
  } | null;
}

interface CommentsResponse {
  comments: Comment[];
  nextCursor: string | null;
}

async function fetchComments(
  username: string,
  cursor?: string,
  sortBy: string = "latest"
): Promise<CommentsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("sortBy", sortBy);
  params.set("limit", "10");

  const response = await fetch(`/api/profile/${username}/comments?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export default function CommentsTab({ username }: { username: string }) {
  const [sortBy, setSortBy] = useState("latest");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["profile-comments", username, sortBy],
    queryFn: ({ pageParam }) => fetchComments(username, pageParam, sortBy),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load comments</p>
        </CardContent>
      </Card>
    );
  }

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

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

      {comments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No comments yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {comments.map((comment) => {
            const linkedPost = comment.idea || comment.post;
            const href = comment.idea
              ? `/idea/${comment.idea.id}`
              : comment.post
              ? `/post/${comment.post.id}`
              : "#";

            return (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <p className="mb-3 line-clamp-3">{comment.content}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      <span>↑ {comment.votesCount}</span>
                    </div>
                    {linkedPost && (
                      <Link
                        href={href}
                        className="text-primary hover:underline text-sm"
                      >
                        View on: {linkedPost.title}
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

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
