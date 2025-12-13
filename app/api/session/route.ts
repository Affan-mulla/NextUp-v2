export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

/**
 * GET /api/session
 * Returns minimal session identity for client-side auth checks.
 * Profile data should be fetched from /api/me instead.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers as any })

    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Return only identity (id, email) - profile comes from /api/me
    return NextResponse.json({ 
      user: {
        id: session.user.id,
        email: session.user.email,
      }
    }, { status: 200 })
  } catch (err) {
    console.error("/api/session error:", err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
