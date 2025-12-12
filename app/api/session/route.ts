export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { mapSessionUser } from "@/lib/auth/session-utils"

/**
 * GET /api/session
 * Returns a minimal session/user object for client-side caching.
 * This endpoint does call Better Auth server-side verification (may touch DB),
 * but it will be called sparingly from the client because React Query will cache it.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers as any })
    const user = session?.user ? mapSessionUser(session.user as any) : null
    console.log(session);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const userWithExtras = {
      ...user, 
      username: session?.user.username,
      name: session?.user.displayName
    };

    return NextResponse.json({ ...userWithExtras }, { status: 200 })
  } catch (err) {
    console.error("/api/session error:", err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
