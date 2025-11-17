/**
 * API route for fetching ideas with pagination
 * GET /api/ideas?cursor={timestamp}
 */

import { getIdeas } from "@/lib/supabase/ideas";
// Alternative: Use Prisma instead of Supabase
// import { getIdeasWithPrisma as getIdeas } from "@/lib/prisma/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // If you get foreign key errors with Supabase,
    // switch to: import { getIdeasWithPrisma as getIdeas } from "@/lib/prisma/ideas";
    const result = await getIdeas(cursor, limit);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error in ideas API:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}
