import { NextRequest, NextResponse } from "next/server";
import { getUserComments } from "@/lib/utils/profile-queries";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") || "latest") as "latest" | "top";

    // Get current user session (optional - works for anonymous users)
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs as any });
    const currentUserId = session?.user?.id;

    const { comments, nextCursor } = await getUserComments(
      username,
      cursor,
      limit,
      sortBy,
      currentUserId
    );

    return NextResponse.json({
      comments,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
