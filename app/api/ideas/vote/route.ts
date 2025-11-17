/**
 * API Route: POST /api/ideas/vote
 * 
 * Handles voting on ideas with proper state management and database updates
 * 
 * CRITICAL: Response format must match cache structure exactly:
 * - votesCount: number (total vote count)
 * - userVote: { type: "UP" | "DOWN" } | null (user's current vote)
 * 
 * Architecture:
 * - Uses Prisma for type-safe database operations
 * - Atomic updates prevent race conditions
 * - Three-state vote logic: create, remove, switch
 * 
 * Request Body:
 * - ideaId: string - ID of the idea being voted on
 * - voteType: "UP" | "DOWN" - Type of vote
 * 
 * Response:
 * - success: boolean - Whether operation succeeded
 * - votesCount: number - Updated total vote count
 * - userVote: { type: "UP" | "DOWN" } | null - User's current vote
 * 
 * Error Handling:
 * - 401: User not authenticated
 * - 400: Invalid request (missing fields, invalid vote type)
 * - 404: Idea not found
 * - 500: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

// Vote type validation
type VoteType = "UP" | "DOWN";
const VALID_VOTE_TYPES: VoteType[] = ["UP", "DOWN"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to vote" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ========================================================================
    // Request Validation
    // ========================================================================

    const body = await request.json();
    const { ideaId, voteType } = body;

    if (!ideaId || typeof ideaId !== "string") {
      return NextResponse.json(
        { error: "Invalid request - ideaId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!voteType || !VALID_VOTE_TYPES.includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid request - voteType must be "UP" or "DOWN"' },
        { status: 400 }
      );
    }

    // ========================================================================
    // Check if Idea Exists
    // ========================================================================

    const ideaExists = await prisma.ideas.findUnique({
      where: { id: ideaId },
      select: { id: true },
    });

    if (!ideaExists) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // ========================================================================
    // Vote Logic (Three-State Machine)
    // ========================================================================

    // Check for existing vote (composite unique constraint: userId + ideaId)
    const existingVote = await prisma.votes.findUnique({
      where: {
        userId_ideaId: {
          userId: userId,
          ideaId: ideaId,
        },
      },
    });

    let voteDelta = 0; // Change in vote count for the idea
    let finalUserVote: { type: VoteType } | null = null;

    /**
     * Vote State Machine:
     * 
     * State 1: No existing vote → Create new vote
     * - Insert new vote record
     * - voteDelta = +1 (UP) or -1 (DOWN)
     * - finalUserVote = { type: voteType }
     * 
     * State 2: Existing vote, same type → Remove vote (toggle off)
     * - Delete vote record
     * - voteDelta = -1 (was UP) or +1 (was DOWN)
     * - finalUserVote = null
     * 
     * State 3: Existing vote, different type → Switch vote
     * - Update vote record to new type
     * - voteDelta = +2 (DOWN→UP) or -2 (UP→DOWN)
     * - finalUserVote = { type: voteType }
     */

    if (existingVote) {
      if (existingVote.type === voteType) {
        // State 2: Remove vote (toggle off)
        await prisma.votes.delete({
          where: {
            userId_ideaId: {
              userId: userId,
              ideaId: ideaId,
            },
          },
        });

        voteDelta = voteType === "UP" ? -1 : 1;
        finalUserVote = null;
      } else {
        // State 3: Switch vote (UP ↔ DOWN)
        await prisma.votes.update({
          where: {
            userId_ideaId: {
              userId: userId,
              ideaId: ideaId,
            },
          },
          data: {
            type: voteType,
          },
        });

        voteDelta = voteType === "UP" ? 2 : -2;
        finalUserVote = { type: voteType };
      }
    } else {
      // State 1: Create new vote
      await prisma.votes.create({
        data: {
          userId: userId,
          ideaId: ideaId,
          type: voteType,
        },
      });

      voteDelta = voteType === "UP" ? 1 : -1;
      finalUserVote = { type: voteType };
    }

    // ========================================================================
    // Update Idea Vote Count (Atomic Operation)
    // ========================================================================

    /**
     * Atomically update vote count using Prisma's increment
     * This prevents race conditions if multiple users vote simultaneously
     */
    const updatedIdea = await prisma.ideas.update({
      where: { id: ideaId },
      data: {
        votesCount: {
          increment: voteDelta,
        },
      },
      select: {
        votesCount: true,
      },
    });

    // ========================================================================
    // Success Response (CRITICAL: Must match cache structure)
    // ========================================================================

    /**
     * Response format MUST match what the frontend cache expects:
     * - votesCount: number
     * - userVote: { type: "UP" | "DOWN" } | null
     * 
     * This ensures server data can be written directly to cache without transformation
     */
    return NextResponse.json({
      success: true,
      votesCount: updatedIdea.votesCount,
      userVote: finalUserVote,
    });

  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    // Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "Idea not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Vote already exists" },
          { status: 409 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
