import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/me
 * 
 * Fetches the authenticated user's full profile from the database.
 * Session only provides identity (id, email); this endpoint provides profile data.
 * 
 * Architecture:
 * - Session = identity (auth.api.getSession)
 * - Database = source of truth (Prisma query)
 * - This API = bridge between auth and profile data
 * 
 * Response shape matches the User interface in user-store.ts
 */
export async function GET(request: NextRequest) {
  try {
    // Get identity from Better Auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch full profile from database (source of truth)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Normalize response to match User interface
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.image,
      bio: user.bio,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt?.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[/api/me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
