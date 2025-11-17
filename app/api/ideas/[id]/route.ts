/**
 * API route for fetching a single idea by ID
 * GET /api/ideas/[id]
 */

import { getIdeaById } from "@/lib/supabase/ideas";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Idea ID is required" },
        { status: 400 }
      );
    }

    const idea = await getIdeaById(id);

    return NextResponse.json(idea, {
      headers: {
        // Cache for 60 seconds, allow stale for 120 seconds
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching idea:", error);
    
    if (error instanceof Error && error.message === "Idea not found") {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch idea" },
      { status: 500 }
    );
  }
}
