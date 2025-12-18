import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User profile data shape
 * Populated from /api/me (database), NOT from auth session
 * 
 * Architecture:
 * - Auth session = identity only (id, email)
 * - This interface = full profile from database
 */
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

/**
 * Store state
 */
interface UserState {
  user: User | null;
  isHydrated: boolean;
  isLoading: boolean;
}

/**
 * Store actions
 */
interface UserActions {
  /** Set user profile (from /api/me response) */
  setUser: (user: User | null) => void;
  
  /** Partial update (optimistic UI) */
  updateUser: (updates: Partial<User>) => void;
  
  /** Clear on logout */
  clearUser: () => void;
  
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  
  /** Mark as hydrated */
  setHydrated: () => void;
}

type UserStore = UserState & UserActions;

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * User Profile Store
 * 
 * Architecture:
 * - Auth session = identity only (id, email) - NOT stored here
 * - This store = profile data from database (/api/me)
 * - Hydrated via ProfileProvider, not auth session
 * 
 * Flow:
 * 1. Auth session verifies identity (useAuthSession)
 * 2. useProfile() fetches from /api/me
 * 3. ProfileProvider hydrates this store
 * 4. Components read from store for instant access
 * 
 * Benefits:
 * - No stale profile data in session
 * - Multi-device consistency (always fetches latest)
 * - Clear separation of concerns
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isHydrated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isLoading: false }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      
      clearUser: () => set({ user: null, isLoading: false }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

/** Get user profile */
export const useUser = () => useUserStore((state) => state.user);

/** Check if authenticated (has profile) */
export const useIsAuthenticated = () => useUserStore((state) => !!state.user);

/** Check if store is hydrated */
export const useIsHydrated = () => useUserStore((state) => state.isHydrated);

/** Check if loading */
export const useIsLoading = () => useUserStore((state) => state.isLoading);

/** Get specific user field */
export const useUserField = <K extends keyof User>(field: K) =>
  useUserStore((state) => state.user?.[field]);

/** Get actions only (never re-renders) */
export const useUserActions = () =>
  useUserStore(
    useShallow((state) => ({
      setUser: state.setUser,
      updateUser: state.updateUser,
      clearUser: state.clearUser,
      setLoading: state.setLoading,
    }))
  );
