import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/session/logout-all
 * Revokes all sessions for the authenticated user
 * Security: User must re-authenticate after this action
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all sessions for the user
    const result = await prisma.session.deleteMany({
      where: { userId: session.user.id },
    });

    console.log(`[logout-all] Revoked ${result.count} session(s) for user ${session.user.id}`);

    return NextResponse.json({
      ok: true,
      message: "All sessions revoked successfully",
      count: result.count,
    });
  } catch (e) {
    console.error("[POST /api/session/logout-all]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
