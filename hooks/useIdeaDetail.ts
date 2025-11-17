/**
 * React Query hook for fetching individual Idea details
 * Implements cache-first strategy with DB fallback
 * 
 * Strategy:
 * 1. First checks React Query cache (from feed data)
 * 2. If not found in cache, fetches from database via API
 * 3. Provides optimistic UI with skeleton during loading
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIdeaById, IdeasResponse } from "@/lib/supabase/ideas";
import { IdeaById } from "@/types/Idea";

export function useIdeaDetail(id: string) {
  const queryClient = useQueryClient();

  return useQuery<IdeaById>({
    queryKey: ["idea", id],
    
    queryFn: async () => {
      // Fetch from database via API route
      const response = await fetch(`/api/ideas/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Idea not found");
        }
        throw new Error("Failed to fetch idea");
      }
      
      return response.json();
    },

    // Cache-first: Check if data exists in feed cache
    initialData: () => {
      // Try to find in the ideas feed cache
      const feed = queryClient.getQueryData<{ pages: IdeasResponse[] }>(["ideas"]);
      
      if (!feed) return undefined;

      // Search through all pages in the infinite query cache
      for (const page of feed.pages) {
        const match = page.ideas.find((idea) => idea.id === id);
        if (match) {
          // Return cached data immediately
          return match as unknown as IdeaById;
        }
      }
      
      return undefined;
    },

    // Consider initial data fresh for 30 seconds
    initialDataUpdatedAt: () => {
      const feed = queryClient.getQueryData<{ pages: IdeasResponse[] }>(["ideas"]);
      if (!feed) return 0;
      
      // Use the timestamp of when feed was last updated
      return queryClient.getQueryState(["ideas"])?.dataUpdatedAt ?? 0;
    },

    // Stale time: Keep data fresh for 2 minutes
    staleTime: 1000 * 60 * 2,
    
    // Garbage collection: Keep in cache for 5 minutes
    gcTime: 1000 * 60 * 5,

    // Refetch options for better UX
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    
    // Retry failed requests
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
