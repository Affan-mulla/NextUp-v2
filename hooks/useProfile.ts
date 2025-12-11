"use client";

import { useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";

interface UseProfileDataOptions {
  username: string;
  sortBy: "latest" | "top";
  enabled?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export function useProfilePosts({ username, sortBy, enabled = true }: UseProfileDataOptions) {
  return useInfiniteQuery({
    queryKey: ["profile-posts", username, sortBy],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("sortBy", sortBy);
      params.set("limit", "10");

      const response = await fetch(`/api/profile/${username}/posts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const data = await response.json();
      return {
        data: data.posts,
        nextCursor: data.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });
}

export function useProfileComments({ username, sortBy, enabled = true }: UseProfileDataOptions) {
  return useInfiniteQuery({
    queryKey: ["profile-comments", username, sortBy],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("sortBy", sortBy);
      params.set("limit", "10");

      const response = await fetch(`/api/profile/${username}/comments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      
      const data = await response.json();
      return {
        data: data.comments,
        nextCursor: data.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });
}

export function useProfileUpvotes({ username, sortBy, enabled = true }: UseProfileDataOptions) {
  return useInfiniteQuery({
    queryKey: ["profile-upvotes", username, sortBy],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("sortBy", sortBy);
      params.set("limit", "10");

      const response = await fetch(`/api/profile/${username}/upvotes?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch upvotes");
      }
      
      const data = await response.json();
      return {
        data: data.votes,
        nextCursor: data.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });
}

export function useProfileDownvotes({ username, sortBy, enabled = true }: UseProfileDataOptions) {
  return useInfiniteQuery({
    queryKey: ["profile-downvotes", username, sortBy],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      params.set("sortBy", sortBy);
      params.set("limit", "10");

      const response = await fetch(`/api/profile/${username}/downvotes?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch downvotes");
      }
      
      const data = await response.json();
      return {
        data: data.votes,
        nextCursor: data.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });
}
