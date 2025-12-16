import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/session/:id
 * Revokes a specific session for the authenticated user
 * Security: Prevents current session deletion, validates ownership
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = request.nextUrl.pathname.split("/").pop();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Fetch the target session
    const target = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!target) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Ensure session belongs to current user
    if (target.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent revoking the current session (use sign-out for that)
    const currentSessionToken = request.cookies.get("better-auth.session_token")?.value;
    if (target.token === currentSessionToken) {
      return NextResponse.json(
        { error: "Cannot revoke current session. Use sign out instead." },
        { status: 400 }
      );
    }

    // Delete the session
    await prisma.session.delete({ where: { id: sessionId } });

    return NextResponse.json({ ok: true, message: "Session revoked successfully" });
  } catch (e) {
    console.error("[DELETE /api/session/:id]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
