import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/account/provider/:providerId
 * Disconnects an OAuth provider from the current user's account
 * Security: Prevents lockout by enforcing at least one sign-in method
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers as any });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerId = params.providerId;

    // Validate providerId
    if (!providerId || providerId === "credentials") {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Fetch user accounts to enforce lockout safety
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
    });

    const hasCredentials = accounts.some((a) => a.providerId === "credentials");
    const oauthAccounts = accounts.filter((a) => a.providerId !== "credentials");
    const targetAccount = oauthAccounts.find((a) => a.providerId === providerId);

    if (!targetAccount) {
      return NextResponse.json(
        { error: `${providerId} is not connected to your account` },
        { status: 404 }
      );
    }

    // Prevent lockout: disallow disconnect if no credentials and only one oauth account
    if (!hasCredentials && oauthAccounts.length <= 1) {
      return NextResponse.json(
        {
          error: "Cannot disconnect your only sign-in method. Please set a password first or connect another provider.",
        },
        { status: 400 }
      );
    }

    // Delete the OAuth account
    await prisma.account.deleteMany({
      where: { userId: session.user.id, providerId },
    });

    console.log(`[disconnect-provider] User ${session.user.id} disconnected ${providerId}`);

    return NextResponse.json({
      ok: true,
      message: `${providerId} disconnected successfully`,
    });
  } catch (e) {
    console.error("[DELETE /api/account/provider/:providerId]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
