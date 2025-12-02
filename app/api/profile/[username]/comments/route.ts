import { NextRequest, NextResponse } from "next/server";
import { getUserComments } from "@/lib/utils/profile-queries";

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

    const { comments, nextCursor } = await getUserComments(username, cursor, limit, sortBy);

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
