import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import { auth } from "@/lib/auth/auth"

// ============================================================================
// CONFIGURATION: Protected Routes
// ============================================================================

const protectedRoutes = [
  "/app",
  "/settings",
  "/dashboard", 
  "/idea",
]


const AUTH_COOKIE_NAME = "better-auth.session_token"


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
