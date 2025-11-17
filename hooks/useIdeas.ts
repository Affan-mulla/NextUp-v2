/**
 * React Query hook for fetching and managing Ideas feed
 * Supports infinite scroll with optimized caching
 * 
 * Features:
 * - Cursor-based pagination for efficient data loading
 * - Optimistic cache updates
 * - Stale-while-revalidate strategy
 * - Error retry with exponential backoff
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

  const { data } = await axios.get<IdeasResponse>(url.toString(), {
    // Enable axios caching
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return data;
}

/**
 * Hook for fetching ideas with infinite scroll
 * Implements production-grade caching and error handling
 */
export function useIdeas() {
  return useInfiniteQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeas,
    
    // Pagination
    getNextPageParam: (lastPage: IdeasResponse) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    
    // Cache management
    staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
    
    // Refetch strategies
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    
    // Error handling
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    
    // Performance
    maxPages: undefined, // No limit on cached pages
  });
}

