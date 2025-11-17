/**
 * React Query Hooks for Comment System
 * Comprehensive hooks with optimistic updates, caching, and error handling
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { VoteType } from "@prisma/client";
import { commentKeys } from "./comment-query-keys";
import type {
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  ReplyListResponse,
  VoteCommentRequest,
  VoteCommentResponse,
  EditCommentRequest,
  EditCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
} from "@/types/comment";

const COMMENTS_PER_PAGE = 20;
const REPLIES_PER_PAGE = 10;

// ============================================================================
// Fetch Comments (Infinite Query)
// ============================================================================

interface FetchCommentsParams {
  ideaId: string;
  cursor?: string | null;
  limit?: number;
}

async function fetchComments({
  ideaId,
  cursor,
  limit = COMMENTS_PER_PAGE,
}: FetchCommentsParams): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    ideaId,
    limit: limit.toString(),
  });
  
  if (cursor) {
    params.append("cursor", cursor);
  }

  const { data } = await axios.get<CommentListResponse>(
    `/api/comment/get?${params.toString()}`
  );
  
  return data;
}

export function useComments(ideaId: string) {
  return useInfiniteQuery({
    queryKey: commentKeys.list(ideaId),
    queryFn: ({ pageParam }) =>
      fetchComments({ ideaId, cursor: pageParam as string | null }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// Fetch Replies (Lazy Load)
// ============================================================================

interface FetchRepliesParams {
  commentId: string;
  cursor?: string | null;
  limit?: number;
}

async function fetchReplies({
  commentId,
  cursor,
  limit = REPLIES_PER_PAGE,
}: FetchRepliesParams): Promise<ReplyListResponse> {
  const params = new URLSearchParams({
    commentId,
    limit: limit.toString(),
  });
  
  if (cursor) {
    params.append("cursor", cursor);
  }

  const { data } = await axios.get<ReplyListResponse>(
    `/api/comment/replies?${params.toString()}`
  );
  
  return data;
}

export function useReplies(commentId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: commentKeys.replies(commentId),
    queryFn: () => fetchReplies({ commentId }),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// Create Comment Mutation
// ============================================================================

async function createComment(
  data: CreateCommentRequest
): Promise<CreateCommentResponse> {
  const { data: responseData } = await axios.post<CreateCommentResponse>(
    "/api/comment/create",
    data
  );
  return responseData;
}

export function useCreateComment(ideaId: string, parentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    
    // Optimistic update
    onMutate: async (newComment) => {
      // Cancel outgoing refetches
      if (parentId) {
        await queryClient.cancelQueries({
          queryKey: commentKeys.replies(parentId),
        });
      } else {
        await queryClient.cancelQueries({
          queryKey: commentKeys.list(ideaId),
        });
      }

      // Snapshot previous value
      const previousData = parentId
        ? queryClient.getQueryData(commentKeys.replies(parentId))
        : queryClient.getQueryData(commentKeys.list(ideaId));

      // Optimistically update cache
      if (parentId) {
        // Update replies cache
        queryClient.setQueryData<ReplyListResponse>(
          commentKeys.replies(parentId),
          (old) => {
            if (!old) {
              return {
                replies: [],
                hasMore: false,
                nextCursor: null,
              };
            }
            
            const optimisticComment: Comment = {
              id: `temp-${Date.now()}`,
              content: newComment.content,
              userId: "", // Will be filled by server
              ideaId: newComment.ideaId,
              postId: null,
              commentId: parentId,
              votesCount: 0,
              isDeleted: false,
              createdAt: new Date(),
              user: {
                id: "",
                username: "You",
                image: null,
              },
              _count: { replies: 0 },
              userVote: null,
            };

            return {
              ...old,
              replies: [optimisticComment, ...old.replies],
            };
          }
        );
        
        // Update parent comment's reply count
        queryClient.setQueriesData<InfiniteData<CommentListResponse>>(
          { queryKey: commentKeys.list(ideaId) },
          (old) => {
            if (!old) return old;
            
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                comments: page.comments.map((comment) =>
                  comment.id === parentId
                    ? {
                        ...comment,
                        _count: {
                          ...comment._count,
                          replies: comment._count.replies + 1,
                        },
                      }
                    : comment
                ),
              })),
            };
          }
        );
      } else {
        // Update main comments cache
        queryClient.setQueryData<InfiniteData<CommentListResponse>>(
          commentKeys.list(ideaId),
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    comments: [],
                    nextCursor: null,
                    hasMore: false,
                  },
                ],
                pageParams: [null],
              };
            }

            const optimisticComment: Comment = {
              id: `temp-${Date.now()}`,
              content: newComment.content,
              userId: "",
              ideaId: newComment.ideaId,
              postId: null,
              commentId: null,
              votesCount: 0,
              isDeleted: false,
              createdAt: new Date(),
              user: {
                id: "",
                username: "You",
                image: null,
              },
              _count: { replies: 0 },
              userVote: null,
            };

            const newPages = [...old.pages];
            newPages[0] = {
              ...newPages[0],
              comments: [optimisticComment, ...newPages[0].comments],
            };

            return {
              ...old,
              pages: newPages,
            };
          }
        );
      }

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        if (parentId) {
          queryClient.setQueryData(
            commentKeys.replies(parentId),
            context.previousData
          );
        } else {
          queryClient.setQueryData(
            commentKeys.list(ideaId),
            context.previousData
          );
        }
      }

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to post comment"
          : "Failed to post comment";
      
      toast.error(errorMessage);
    },

    onSuccess: (data) => {
      // Invalidate queries to get fresh data
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.replies(parentId),
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(ideaId),
      });
      
      toast.success(data.message || "Comment posted successfully!");
    },
  });
}

// ============================================================================
// Vote Comment Mutation
// ============================================================================

interface VoteCommentParams {
  commentId: string;
  voteType: VoteType | null;
}

async function voteComment({
  commentId,
  voteType,
}: VoteCommentParams): Promise<VoteCommentResponse> {
  const { data } = await axios.post<VoteCommentResponse>("/api/comment/vote", {
    commentId,
    voteType,
  });
  return data;
}

export function useVoteComment(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteComment,
    
    // Optimistic update
    onMutate: async ({ commentId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: commentKeys.list(ideaId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<
        InfiniteData<CommentListResponse>
      >(commentKeys.list(ideaId));

      // Calculate vote delta
      const calculateVoteDelta = (
        currentVote: VoteType | null | undefined,
        newVote: VoteType | null
      ): number => {
        if (currentVote === newVote) return 0;
        
        if (currentVote === null || currentVote === undefined) {
          return newVote === "UP" ? 1 : newVote === "DOWN" ? -1 : 0;
        }
        
        if (newVote === null) {
          return currentVote === "UP" ? -1 : 1;
        }
        
        if (currentVote === "UP" && newVote === "DOWN") return -2;
        if (currentVote === "DOWN" && newVote === "UP") return 2;
        
        return 0;
      };

      // Optimistically update cache
      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        commentKeys.list(ideaId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              comments: page.comments.map((comment) => {
                if (comment.id === commentId) {
                  const delta = calculateVoteDelta(comment.userVote, voteType);
                  return {
                    ...comment,
                    votesCount: comment.votesCount + delta,
                    userVote: voteType,
                  };
                }
                return comment;
              }),
            })),
          };
        }
      );

      // Also update replies cache if this is a reply
      const allRepliesQueries = queryClient.getQueriesData<ReplyListResponse>({
        queryKey: commentKeys.all,
      });

      allRepliesQueries.forEach(([queryKey, data]) => {
        if (data && 'replies' in data) {
          queryClient.setQueryData<ReplyListResponse>(queryKey, {
            ...data,
            replies: data.replies.map((reply) => {
              if (reply.id === commentId) {
                const delta = calculateVoteDelta(reply.userVote, voteType);
                return {
                  ...reply,
                  votesCount: reply.votesCount + delta,
                  userVote: voteType,
                };
              }
              return reply;
            }),
          });
        }
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousData
        );
      }

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to vote"
          : "Failed to vote";
      
      toast.error(errorMessage);
    },

    onSuccess: (data) => {
      // Optionally show success message (can be removed for silent voting)
      // toast.success(data.message);
    },

    // Settle queries after mutation
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(ideaId),
      });
    },
  });
}

// ============================================================================
// Helper: Prefetch Replies
// ============================================================================

export function usePrefetchReplies() {
  const queryClient = useQueryClient();

  return (commentId: string) => {
    queryClient.prefetchQuery({
      queryKey: commentKeys.replies(commentId),
      queryFn: () => fetchReplies({ commentId }),
      staleTime: 1000 * 60 * 5,
    });
  };
}

// ============================================================================
// Edit Comment Mutation
// ============================================================================

async function editComment(
  data: EditCommentRequest
): Promise<EditCommentResponse> {
  const { data: responseData } = await axios.patch<EditCommentResponse>(
    "/api/comment/edit",
    data
  );
  return responseData;
}

export function useEditComment(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editComment,
    
    // Optimistic update
    onMutate: async ({ commentId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: commentKeys.list(ideaId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<
        InfiniteData<CommentListResponse>
      >(commentKeys.list(ideaId));

      // Optimistically update main comments cache
      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        commentKeys.list(ideaId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              comments: page.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, content }
                  : comment
              ),
            })),
          };
        }
      );

      // Also update replies cache if this is a reply
      const allRepliesQueries = queryClient.getQueriesData<ReplyListResponse>({
        queryKey: commentKeys.all,
      });

      allRepliesQueries.forEach(([queryKey, data]) => {
        if (data && 'replies' in data) {
          queryClient.setQueryData<ReplyListResponse>(queryKey, {
            ...data,
            replies: data.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, content }
                : reply
            ),
          });
        }
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousData
        );
      }

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to edit comment"
          : "Failed to edit comment";
      
      toast.error(errorMessage);
    },

    onSuccess: (data) => {
      toast.success(data.message || "Comment updated successfully!");
    },

    // Settle queries after mutation
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(ideaId),
      });
    },
  });
}

// ============================================================================
// Delete Comment Mutation
// ============================================================================

async function deleteComment(
  data: DeleteCommentRequest
): Promise<DeleteCommentResponse> {
  const { data: responseData } = await axios.delete<DeleteCommentResponse>(
    "/api/comment/delete",
    { data }
  );
  return responseData;
}

export function useDeleteComment(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    
    // Optimistic update
    onMutate: async ({ commentId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: commentKeys.list(ideaId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<
        InfiniteData<CommentListResponse>
      >(commentKeys.list(ideaId));

      // Optimistically update main comments cache
      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        commentKeys.list(ideaId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              comments: page.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, isDeleted: true, content: "[deleted]" }
                  : comment
              ),
            })),
          };
        }
      );

      // Also update replies cache if this is a reply
      const allRepliesQueries = queryClient.getQueriesData<ReplyListResponse>({
        queryKey: commentKeys.all,
      });

      allRepliesQueries.forEach(([queryKey, data]) => {
        if (data && 'replies' in data) {
          queryClient.setQueryData<ReplyListResponse>(queryKey, {
            ...data,
            replies: data.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, isDeleted: true, content: "[deleted]" }
                : reply
            ),
          });
        }
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          commentKeys.list(ideaId),
          context.previousData
        );
      }

      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to delete comment"
          : "Failed to delete comment";
      
      toast.error(errorMessage);
    },

    onSuccess: (data) => {
      toast.success(data.message || "Comment deleted successfully!");
    },

    // Settle queries after mutation
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(ideaId),
      });
    },
  });
}
