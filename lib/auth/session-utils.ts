import { authClient } from "@/lib/auth/auth-client";
import type { User } from "@/lib/store/user-store";

/**
 * Session utilities for Better Auth integration
 * 
 * These helper functions standardize how we fetch and map
 * session data to our User interface across the app.
 */

/**
 * Fetches current session and maps to User interface
 * Returns null if no session exists
 * 
 * Usage:
 * ```ts
 * const user = await fetchSessionUser();
 * if (user) {
 *   setUser(user);
 * }
 * ```
 */
export async function fetchSessionUser(): Promise<User | null> {
  try {
    const session = await authClient.getSession();
    
    if (!session.data?.user) {
      return null;
    }

    // Map Better Auth user to our User interface
    return {
      id: session.data.user.id,
      name: session.data.user.name,
      email: session.data.user.email,
      avatar: session.data.user.image || undefined,
      emailVerified: session.data.user.emailVerified,
      createdAt: session.data.user.createdAt?.toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch session user:", error);
    return null;
  }
}

/**
 * Type guard to check if session user exists
 * 
 * Usage:
 * ```ts
 * const session = await authClient.getSession();
 * if (hasSessionUser(session)) {
 *   // TypeScript knows session.data.user exists
 *   console.log(session.data.user.email);
 * }
 * ```
 */
export function hasSessionUser(
  session: Awaited<ReturnType<typeof authClient.getSession>>
): session is Awaited<ReturnType<typeof authClient.getSession>> & {
  data: { user: NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>["user"] };
} {
  return !!(session.data?.user);
}

/**
 * Maps Better Auth session user to our User interface
 * Throws if user is null (use with hasSessionUser guard)
 * 
 * Usage:
 * ```ts
 * const session = await authClient.getSession();
 * if (hasSessionUser(session)) {
 *   const user = mapSessionUser(session.data.user);
 *   setUser(user);
 * }
 * ```
 */
export function mapSessionUser(
  sessionUser: NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>["user"]
): User {
  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    avatar: sessionUser.image || undefined,
    emailVerified: sessionUser.emailVerified,
    createdAt: sessionUser.createdAt?.toISOString(),
  };
}
