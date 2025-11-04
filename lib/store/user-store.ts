import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User data shape - extend this with additional fields as needed
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  emailVerified?: boolean;
  image?: string;
}

/**
 * User store state interface
 */
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // Track if store has been hydrated from storage
  isLoading: boolean; // Track if session is being fetched
}

/**
 * User store actions interface
 */
interface UserActions {
  /**
   * Set complete user data (e.g., after login)
   */
  setUser: (user: User | null) => void;
  
  /**
   * Partially update user data (e.g., profile edit)
   */
  updateUser: (updates: Partial<User>) => void;
  
  /**
   * Clear user data (e.g., on logout)
   */
  clearUser: () => void;
  
  /**
   * Check if user is authenticated
   */
  checkAuth: () => boolean;

  /**
   * Hydrate user from auth session (Better Auth, Supabase, etc.)
   * Call this on app mount to restore session
   */
  hydrateFromSession: (sessionUser: User | null) => void;

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Mark store as hydrated (called by persist middleware)
   */
  setHydrated: () => void;
}

/**
 * Combined store type
 */
type UserStore = UserState & UserActions;

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * User store with persist middleware
 * - Stores user state in localStorage for session persistence
 * - Uses 'user-storage' as the storage key
 * - Automatically rehydrates state on app load
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,

      // ========================================================================
      // Actions
      // ========================================================================

      /**
       * Set user data and mark as authenticated
       * Use this after successful login/signup or session restore
       */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      /**
       * Partially update user data while preserving existing fields
       * Use this for profile updates, avatar changes, etc.
       */
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      /**
       * Clear user data and mark as unauthenticated
       * Use this on logout
       */
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      /**
       * Check authentication status
       * Returns true if user exists and is authenticated
       */
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.user !== null;
      },

      /**
       * Hydrate user from auth session
       * Call this on app mount to sync with auth provider
       */
      hydrateFromSession: (sessionUser) => {
        set({
          user: sessionUser,
          isAuthenticated: !!sessionUser,
          isHydrated: true,
          isLoading: false,
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      /**
       * Mark store as hydrated
       */
      setHydrated: () =>
        set({
          isHydrated: true,
        }),
    }),
    {
      name: 'user-storage', // localStorage key
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for better security
      partialize: (state) => ({
        // Only persist user data, not loading/hydration flags
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration completes
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

/**
 * Selector hooks to prevent unnecessary re-renders
 * Use these in components instead of accessing the full store
 */

/**
 * Get user object (subscribes only to user changes)
 */
export const useUser = () => useUserStore((state) => state.user);

/**
 * Get authentication status (subscribes only to isAuthenticated)
 */
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);

/**
 * Get hydration status (to prevent hydration mismatches)
 */
export const useIsHydrated = () => useUserStore((state) => state.isHydrated);

/**
 * Get loading status
 */
export const useIsLoading = () => useUserStore((state) => state.isLoading);

/**
 * Get specific user field (e.g., just email or name)
 * Most performant - only re-renders when that specific field changes
 */
export const useUserField = <K extends keyof User>(field: K) =>
  useUserStore((state) => state.user?.[field]);

/**
 * Get only the actions (never causes re-renders)
 * Uses shallow comparison to ensure stable reference
 */
export const useUserActions = () =>
  useUserStore(
    useShallow((state) => ({
      setUser: state.setUser,
      updateUser: state.updateUser,
      clearUser: state.clearUser,
      checkAuth: state.checkAuth,
      hydrateFromSession: state.hydrateFromSession,
      setLoading: state.setLoading,
    }))
  );
