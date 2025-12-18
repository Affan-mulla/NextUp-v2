"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

/**
 * Auth Session Hook - Identity Only
 * 
 * This hook provides ONLY identity data from Better Auth session.
 * Profile data should be fetched via useProfile() hook.
 * 
 * Session contains:
 * - user.id (identity)
 * - user.email (identity)
 * - session metadata
 * 
 * Session does NOT contain:
 * - name, username, bio, avatar (use useProfile)
 */

export const AUTH_SESSION_KEY = ["auth", "session"] as const;

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Fetch auth session (identity only)
 */
async function fetchAuthSession(): Promise<AuthSession | null> {
  try {
    const session = await authClient.getSession();
    
    if (!session.data?.user?.id) {
      return null;
    }

    return {
      user: {
        id: session.data.user.id,
        email: session.data.user.email,
      },
      session: {
        id: session.data.session.id,
        expiresAt: session.data.session.expiresAt,
      },
    };
  } catch (error) {
    console.error("[useAuthSession] Error:", error);
    return null;
  }
}

/**
 * Hook for auth session (identity only)
 * 
 * Use this to check if user is authenticated.
 * For profile data, use useProfile() instead.
 * 
 * Usage:
 * ```tsx
 * const { data: session, isLoading } = useAuthSession();
 * const isAuthenticated = !!session;
 * ```
 */
export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_SESSION_KEY,
    queryFn: fetchAuthSession,
    staleTime: 1000 * 60 * 10, // 10 minutes (session rarely changes)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
  });
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
  const { data: session, isLoading } = useAuthSession();
  return {
    isAuthenticated: !!session,
    isLoading,
    userId: session?.user.id,
  };
}

/**
 * Hook to invalidate auth session
 * Call after login/logout
 */
export function useInvalidateAuthSession() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: AUTH_SESSION_KEY });
  };
}
