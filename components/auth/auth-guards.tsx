"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useIsHydrated, useIsLoading } from "@/lib/store/user-store";

/**
 * AuthGuard - Protect routes from unauthenticated access
 * 
 * Features:
 * - Redirects unauthenticated users to login
 * - Shows loading state while checking auth
 * - Prevents flash of protected content
 * - Handles hydration properly (SSR safe)
 * 
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <YourProtectedContent />
 *     </AuthGuard>
 *   );
 * }
 * ```
 */
export function AuthGuard({
  children,
  redirectTo = "/auth/sign-in",
  loadingComponent,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const isLoading = useIsLoading();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after store is fully hydrated
    if (isHydrated && !isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isHydrated, isLoading, router, redirectTo]);

  // Show loading while:
  // 1. Store is rehydrating from storage
  // 2. Session is being fetched
  // 3. User is not authenticated (about to redirect)
  if (!isHydrated || isLoading || !isAuthenticated) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

/**
 * GuestGuard - Redirect authenticated users away from auth pages
 * 
 * Use this on login/signup pages to redirect already-logged-in users
 * 
 * Usage:
 * ```tsx
 * export default function LoginPage() {
 *   return (
 *     <GuestGuard>
 *       <LoginForm />
 *     </GuestGuard>
 *   );
 * }
 * ```
 */
export function GuestGuard({
  children,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isHydrated, router, redirectTo]);

  // Show login form only after hydration completes
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // If authenticated, show nothing (about to redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * RoleGuard - Protect routes based on user role
 * 
 * Usage:
 * ```tsx
 * export default function AdminPage() {
 *   return (
 *     <RoleGuard allowedRoles={["admin"]}>
 *       <AdminDashboard />
 *     </RoleGuard>
 *   );
 * }
 * ```
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/",
  fallback,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}) {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  // Import inside component to avoid circular dependencies
  const { useUserField } = require("@/lib/store/user-store");
  const role = useUserField("role");

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || (role && !allowedRoles.includes(role)))) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isHydrated, role, allowedRoles, router, redirectTo]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // User is authenticated but doesn't have required role
  if (!role || !allowedRoles.includes(role)) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
