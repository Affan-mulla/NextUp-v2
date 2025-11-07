/**
 * React Query hook for fetching and managing Ideas feed
 * Supports infinite scroll
 */

"use client";

import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import type { IdeasResponse } from "@/lib/supabase/ideas";

/**
 * Fetch ideas from API with cursor-based pagination
 */
async function fetchIdeas(
  context: QueryFunctionContext<readonly unknown[], string | undefined>
): Promise<IdeasResponse> {
  const url = new URL("/api/ideas", window.location.origin);
  if (context.pageParam) {
    url.searchParams.set("cursor", context.pageParam);
  }

  const { data } = await axios.get<IdeasResponse>(url.toString());

  return data;
}

/**
 * Hook for fetching ideas with infinite scroll
 */
export function useIdeas() {
  return useInfiniteQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
    getNextPageParam: (lastPage: IdeasResponse) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

  });
}
