"use client";

import { useEffect, useRef } from "react";
import { useUserActions, useIsHydrated } from "@/lib/store/user-store";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuthSession } from "@/lib/hooks/useAuthSession";

/**
 * ProfileProvider - Hydrates user profile from database
 * 
 * Architecture:
 * - Auth session = identity only (id, email)
 * - Profile = full user data from /api/me
 * - Store = client cache for instant access
 * 
 * Flow:
 * 1. Check auth session (identity)
 * 2. If authenticated, fetch profile from /api/me
 * 3. Hydrate Zustand store with profile data
 * 4. Components read from store
 * 
 * Benefits:
 * - No stale data in session tokens
 * - Multi-device consistency
 * - Clear separation: auth vs profile
 */
export function SessionProvider({ 
  children,
  debug = false,
}: { 
  children: React.ReactNode;
  debug?: boolean;
}) {
  const { setUser, clearUser, setLoading } = useUserActions();
  const isHydrated = useIsHydrated();
  const debugRef = useRef(debug);
  const previousAuthState = useRef<boolean | null>(null);

  // Step 1: Check auth session (identity only)
  const { 
    data: authSession, 
    isLoading: authLoading 
  } = useAuthSession();
  
  const isAuthenticated = !!authSession;

  // Step 2: Fetch profile from database (only if authenticated)
  const { 
    data: profile, 
    isLoading: profileLoading,
    error: profileError,
  } = useProfile({
    enabled: isAuthenticated && isHydrated,
  });

  // Step 3: Hydrate store when profile is loaded
  useEffect(() => {
    if (!isHydrated) return;
    
    // Set loading while fetching
    if (authLoading || profileLoading) {
      setLoading(true);
      return;
    }

    // Handle logout: auth session gone
    if (!isAuthenticated && previousAuthState.current === true) {
      if (debugRef.current) console.log("[Profile] User logged out, clearing store");
      clearUser();
      previousAuthState.current = false;
      return;
    }

    // Handle login/profile loaded
    if (isAuthenticated && profile) {
      if (debugRef.current) console.log("[Profile] Hydrating store:", profile);
      setUser(profile);
      previousAuthState.current = true;
      return;
    }

    // Handle no auth
    if (!isAuthenticated) {
      setLoading(false);
      previousAuthState.current = false;
    }
  }, [isHydrated, authLoading, profileLoading, isAuthenticated, profile, setUser, clearUser, setLoading]);

  // Log errors in debug mode
  useEffect(() => {
    if (debugRef.current && profileError) {
      console.error("[Profile] Error fetching profile:", profileError);
    }
  }, [profileError]);

  return <>{children}</>;
}
