"use client";

import { useEffect, useRef } from "react";
import { useUserActions, useIsHydrated } from "@/lib/store/user-store";
import { useSessionQuery } from "@/lib/hooks/useSession";

/**
 * SessionProvider - Automatically hydrates user state on app mount
 * 
 * Optimizations:
 * - Single session fetch (no retry loop)
 * - Memoized callback to prevent recreating function
 * - Proper cleanup on unmount
 * - Minimal re-renders (only on isHydrated change)
 * - Production logging (errors only, optional debug mode)
 * - Centralized session mapping via session-utils
 * 
 * Usage: Wrap your app layout with this provider
 */
export function SessionProvider({ 
  children,
  debug = false, // Enable detailed logging in development
}: { 
  children: React.ReactNode;
  debug?: boolean;
}) {
  const { hydrateFromSession, setLoading } = useUserActions();
  const isHydrated = useIsHydrated();
  const isInitialized = useRef(false);

  // Use React Query to fetch/cached the session. React Query controls when
  // the session is refetched (staleTime, window focus, etc.). We only
  // hydrate the Zustand store when the query returns.
  const { data: sessionUser, isLoading: queryLoading } = useSessionQuery({
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (user) => {
      hydrateFromSession(user)
      setLoading(false)
      if (debug && user) console.log("✅ Session hydrated:", user.email)
      if (debug && !user) console.log("⚠️ No active session")
    }
  })

  useEffect(() => {
    // Prevent duplicate initialization (React Strict Mode, hot reload)
    if (isInitialized.current) return;
    
    // Only initialize after store has rehydrated from storage
    if (!isHydrated) return;

    isInitialized.current = true;

    // If React Query is still loading we mark loading; otherwise the
    // onSuccess handler will hydrate and clear loading.
    if (queryLoading) {
      setLoading(true)
    } else if (sessionUser !== undefined) {
      hydrateFromSession(sessionUser ?? null)
      setLoading(false)
    }

    // Cleanup function (though initSession has no side effects to clean)
    return () => {
      // Future: Could add session polling cleanup here if needed
    };
  }, [isHydrated, queryLoading, sessionUser, hydrateFromSession]);

  return <>{children}</>;
}
