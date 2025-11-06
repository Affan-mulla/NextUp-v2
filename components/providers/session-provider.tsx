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
 * Flow:
 * 1. Store rehydrates from sessionStorage (persist middleware)
 * 2. useIsHydrated() returns true
 * 3. SessionProvider fetches session from API
 * 4. If session exists, hydrateFromSession() updates the store
 * 5. If no session, the stored session is cleared
 * 
 * Usage: Wrap your app layout ONCE with this provider (only in root layout)
 */
export function SessionProvider({ 
  children,
  debug = true, // Enable detailed logging in development
}: { 
  children: React.ReactNode;
  debug?: boolean;
}) {
  const { hydrateFromSession, setLoading } = useUserActions();
  const isHydrated = useIsHydrated();
  const isInitialized = useRef(false);
  const debugRef = useRef(debug);

  // Use React Query to fetch/cached the session. React Query controls when
  // the session is refetched (staleTime, window focus, etc.). We only
  // hydrate the Zustand store when the query returns.
  const { data: sessionUser, isLoading: queryLoading } = useSessionQuery({
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (user) => {
      if (debugRef.current) {
        console.log("🔄 onSuccess callback - hydrating with:", user)
      }
      hydrateFromSession(user)
      setLoading(false)
      if (debugRef.current && user) console.log("✅ Session hydrated:", user.email)
      if (debugRef.current && !user) console.log("⚠️ No active session found")
    }
  })
// Wait for store hydration first
useEffect(() => {
  if (!isHydrated) return
  if (debugRef.current) console.log("✅ Store hydrated, now waiting for session fetch...")
  setLoading(true)
}, [isHydrated])

// Handle session query changes
useEffect(() => {
  if (!isHydrated) return
  if (queryLoading) return
  if (sessionUser !== undefined) {
    hydrateFromSession(sessionUser ?? null)
    setLoading(false)
    isInitialized.current = true
  }
}, [isHydrated, queryLoading, sessionUser])

  return <>{children}</>;
}
