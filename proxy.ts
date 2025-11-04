import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

// ============================================================================
// CONFIGURATION: Protected Routes
// ============================================================================

/**
 * Add or remove routes here to control which paths require authentication.
 * 
 * Examples:
 * - "/settings"       → protects /settings and all sub-routes like /settings/profile
 * - "/dashboard"      → protects /dashboard and /dashboard/analytics
 * - "/idea"           → protects /idea and /idea/123
 * 
 * The middleware will automatically check all sub-paths, so you only need
 * to specify the top-level route.
 */
const protectedRoutes = [
  "/settings",
  "/dashboard", 
  "/idea",
]

/**
 * The Better Auth session cookie name.
 * 
 * By default, Better Auth sets a cookie named "better-auth.session_token".
 * If you've customized this in your Better Auth config, update it here.
 * 
 * To find your cookie name:
 * 1. Sign in to your app
 * 2. Open browser DevTools → Application/Storage → Cookies
 * 3. Look for a cookie that starts with "better-auth" or similar
 */
const AUTH_COOKIE_NAME = "better-auth.session_token"

// ============================================================================
// MIDDLEWARE IMPLEMENTATION
// ============================================================================

/**
 * Next.js Middleware - Lightweight Route Protection
 * 
 * This middleware protects routes WITHOUT hitting the database or making
 * expensive API calls. It only checks for the presence of a session cookie.
 * 
 * Flow:
 * 1. Check if the current route is in the protected routes list
 * 2. If protected, verify the Better Auth session cookie exists
 * 3. If cookie is missing, redirect to sign-in with a redirectedFrom param
 * 4. If cookie exists, allow the request through
 * 
 * Note: This is NOT a security boundary. Server-side validation still
 * happens in API routes and server components. This is purely for UX
 * (instant redirects without waiting for DB queries).
 */
export async function proxy(request: NextRequest) {
  // Update Supabase session cookies if needed (keeps tokens fresh)
  const refreshed = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If not a protected route, allow through immediately
  if (!isProtectedRoute) {
    return refreshed
  }

  // For protected routes: check for Better Auth session cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)
  const hasValidCookie = !!sessionCookie?.value

  // If no valid session cookie, redirect to sign-in
  if (!hasValidCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    
    // Add redirectedFrom param so user returns to original page after sign-in
    signInUrl.searchParams.set("redirectedFrom", pathname)
    
    return NextResponse.redirect(signInUrl)
  }

  // Cookie exists - allow request through
  // (Precise server-side validation happens in API routes when needed)
  return refreshed
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

/**
 * Matcher configuration for Next.js middleware
 * 
 * This tells Next.js which routes to run the middleware on.
 * We exclude static files and Next.js internals for performance.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
