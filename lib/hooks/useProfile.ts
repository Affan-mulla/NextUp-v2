"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User } from "@/lib/store/user-store";

/**
 * Profile Query Hook
 * 
 * Fetches user profile from /api/me (database source of truth).
 * Separate from auth session - session only provides identity.
 * 
 * Architecture:
 * - Session = identity (id, email) - handled by auth
 * - Profile = full user data - fetched from DB via this hook
 * - Cache = performance layer - managed by React Query
 */

export const PROFILE_QUERY_KEY = ["profile", "me"] as const;

interface UseProfileOptions {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Time until data is considered stale (ms) */
  staleTime?: number;
  /** Callback on successful fetch */
  onSuccess?: (user: User) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Fetch current user's profile from database
 */
async function fetchProfile(): Promise<User | null> {
  const response = await fetch("/api/me", {
    credentials: "include", // Include auth cookies
  });

  if (response.status === 401) {
    // Not authenticated - return null (not an error)
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to fetch and cache user profile
 * 
 * Usage:
 * ```tsx
 * const { data: profile, isLoading } = useProfile();
 * ```
 */
export function useProfile(options: UseProfileOptions = {}) {
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutes
    onSuccess,
    onError,
  } = options;

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    enabled,
    staleTime,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true,
    retry: 1, // Single retry on failure
  });
}

/**
 * Hook to invalidate profile cache
 * Call after mutations that change user data
 * 
 * Usage:
 * ```tsx
 * const invalidateProfile = useInvalidateProfile();
 * await updateProfile(data);
 * invalidateProfile();
 * ```
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
  };
}

/**
 * Hook to get cached profile without refetching
 * Useful for reading cached data in event handlers
 */
export function useProfileCache() {
  const queryClient = useQueryClient();
  
  return {
    get: () => queryClient.getQueryData<User | null>(PROFILE_QUERY_KEY),
    set: (data: User | null) => queryClient.setQueryData(PROFILE_QUERY_KEY, data),
  };
}

/**
 * Hook to prefetch profile (e.g., on hover)
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: PROFILE_QUERY_KEY,
      queryFn: fetchProfile,
      staleTime: 1000 * 60 * 5,
    });
  };
}
