import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserUpvotes } from "@/lib/utils/profile-queries";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profileUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!profileUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (profileUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") || "latest") as "latest" | "top";

    const { votes, nextCursor } = await getUserUpvotes(
      profileUser.id,
      cursor,
      limit,
      sortBy
    );

    return NextResponse.json({
      votes,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user upvotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch upvotes" },
      { status: 500 }
    );
  }
}
