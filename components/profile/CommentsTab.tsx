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
import Link from "next/link";
import { useState } from "react";
import { CommentSkeleton } from "./CommentSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { timeAgo } from "@/lib/utils/time";
import VotesButton from "../comment/VotesButton";
import axios from "axios";
import { ProfileComment } from "@/types/profile";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon,  } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import CommentAction from "../comment/CommentAction";

interface CommentsResponse {
  comments: ProfileComment[];
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

  const response = await axios.get(
    `/api/profile/${username}/comments?${params.toString()}`
  );
  if (response.status  !== 200) throw new Error("Failed to fetch comments");
  return response.data;
}

export default function CommentsTab({ username }: { username: string }) {
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

  console.log({comments : comments});
  
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
        <div className=" divide-y divide-muted">
          {comments.map((comment,i) => <CommentItem key={i} comment={comment} router={router} />)}

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


function CommentItem({
  comment,
  router,
}: {
  comment: ProfileComment;
  router: any;
}) {
  const linked = comment.idea || comment.post;
  const href = comment.idea
    ? `/idea/${comment.idea.id}`
    : `/post/${comment.post?.id}`;

  return (
    <div className="py-3">
      {/* Click wrapper */}
      <div
        className="p-3 rounded-md hover:bg-foreground/5 transition-colors cursor-pointer"
        onClick={() => router.push(href)}
      >
        {/* Top Row: Avatar + user info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {comment.user.username[0].toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={comment.user.image ?? ""} />
          </Avatar>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={`/u/${comment.user.username}`}
              className="text-sm font-medium hover:underline hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {comment.user.username}
            </Link>

            {comment.commentId && (
              <>
                <p className="text-xs text-muted-foreground">replied to</p>
                <Link
                  href={`/u/${comment.parent?.user.username}`}
                  className="text-sm hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {comment.parent?.user.username}
                </Link>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              {timeAgo(new Date(comment.createdAt))}
            </p>
          </div>
        </div>

        {/* Post name */}
        <Link
          href={href}
          className="text-sm text-muted-foreground hover:text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {linked?.title}
        </Link>

        {/* Content */}
        <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
      </div>

      {/* Footer actions – not clickable to parent */}
      <div className="flex items-center gap-2 px-3 mt-1">
        <VotesButton
          initialVotesCount={comment.votesCount}
          commentId={comment.id}
          ideaId={comment.idea?.id || comment.post?.id || ""}
          initialUserVote={comment.votes}
        />

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <HugeiconsIcon icon={Message01Icon} className="size-4" />
          <span className="text-xs">Reply</span>
        </Button>

        <CommentAction
          commentId={comment.id}
          ideaId={comment.idea?.id || comment.post?.id || ""}
          onEditClick={() => {
            router.push(`${href}#edit-comment-${comment.id}`);
          }}
        
        />
      </div>
    </div>
  );
}