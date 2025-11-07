/**
 * API Route: Create Idea
 * Handles server-side creation of ideas with image uploads
 * CRITICAL: Ensures all image uploads complete BEFORE database insert
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  uploadBase64ImagesToSupabase,
  uploadFilesToSupabase,
  replaceBase64WithSupabaseUrls,
} from "@/lib/supabase/image-upload";
import { auth } from "@/lib/auth/auth";

// Type for the request body
interface CreateIdeaRequest {
  title: string;
  description: string; // JSON stringified Lexical editor state
  uploadedImageUrls?: string[];
}

/**
 * POST /api/ideas/create
 * Creates a new idea with images
 * Requires authentication
 * 
 * Process:
 * 1. Validate authentication
 * 2. Validate input data
 * 3. Extract and upload base64 images from editor
 * 4. Replace base64 with Supabase URLs in content
 * 5. Handle separately uploaded files
 * 6. Wait for ALL uploads to complete
 * 7. INSERT into database with final URLs
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/ideas/create] Starting idea creation flow...");

    // ============================================================
    // STEP 1: Validate Authentication
    // ============================================================
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      console.error("[POST /api/ideas/create] ❌ Unauthorized: No session");
      return NextResponse.json(
        { error: "Unauthorized - Please log in to create ideas" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`[POST /api/ideas/create] ✅ Authenticated user: ${userId}`);

    // ============================================================
    // STEP 2: Parse and Validate Input
    // ============================================================
    let body: CreateIdeaRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error("[POST /api/ideas/create] ❌ Invalid JSON:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || !body.description) {
      console.error("[POST /api/ideas/create] ❌ Missing required fields");
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Parse and validate title
    const titleTrimmed = body.title.trim();
    if (titleTrimmed.length < 3 || titleTrimmed.length > 200) {
      console.error("[POST /api/ideas/create] ❌ Invalid title length");
      return NextResponse.json(
        { error: "Title must be between 3 and 200 characters" },
        { status: 400 }
      );
    }

    console.log(`[POST /api/ideas/create] ✅ Input validation passed: "${titleTrimmed}"`);

    // ============================================================
    // STEP 3: Parse Description
    // ============================================================
    let descriptionJson: any;
    try {
      descriptionJson =
        typeof body.description === "string"
          ? JSON.parse(body.description)
          : body.description;
    } catch (error) {
      console.error("[POST /api/ideas/create] ❌ Failed to parse description:", error);
      return NextResponse.json(
        { error: "Invalid description format" },
        { status: 400 }
      );
    }

    let descriptionString = JSON.stringify(descriptionJson);
    console.log(`[POST /api/ideas/create] ✅ Description parsed (length: ${descriptionString.length})`);

    // ============================================================
    // STEP 4: Upload Base64 Images from Editor
    // ============================================================
    console.log("[POST /api/ideas/create] Starting base64 image extraction and upload...");
    let base64ImageMapping: Map<string, string>;
    
    try {
      base64ImageMapping = await uploadBase64ImagesToSupabase(
        descriptionString,
        userId
      );
      console.log(`[POST /api/ideas/create] ✅ Base64 upload complete: ${base64ImageMapping.size} images`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[POST /api/ideas/create] ❌ Base64 upload failed:", errorMsg);
      return NextResponse.json(
        { error: `Failed to upload editor images: ${errorMsg}` },
        { status: 500 }
      );
    }

    // ============================================================
    // STEP 5: Replace Base64 URLs with Supabase URLs
    // ============================================================
    if (base64ImageMapping.size > 0) {
      console.log("[POST /api/ideas/create] Replacing base64 URLs with Supabase URLs...");
      try {
        descriptionString = replaceBase64WithSupabaseUrls(
          descriptionString,
          base64ImageMapping
        );
        console.log("[POST /api/ideas/create] ✅ Base64 URLs replaced");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error("[POST /api/ideas/create] ❌ URL replacement failed:", errorMsg);
        return NextResponse.json(
          { error: `Failed to process editor images: ${errorMsg}` },
          { status: 500 }
        );
      }
    }

    // ============================================================
    // STEP 6: Handle Manually Uploaded Files
    // ============================================================
    let finalUploadedImages: string[] = body.uploadedImageUrls || [];
    
    // Note: Manually uploaded images should already be uploaded to Supabase
    // by the client before sending this request. This is just for reference.
    // The uploadedImageUrls array contains the final Supabase public URLs.
    
    console.log(`[POST /api/ideas/create] ✅ Manually uploaded images: ${finalUploadedImages.length}`);

    // ============================================================
    // STEP 7: Parse Updated Description
    // ============================================================
    let finalDescription: any;
    try {
      finalDescription = JSON.parse(descriptionString);
      console.log("[POST /api/ideas/create] ✅ Final description prepared");
    } catch (error) {
      console.error("[POST /api/ideas/create] ❌ Failed to parse final description:", error);
      return NextResponse.json(
        { error: "Failed to finalize description" },
        { status: 500 }
      );
    }

    // ============================================================
    // STEP 8: CREATE IDEA IN DATABASE
    // ============================================================
    // CRITICAL: Only insert AFTER all uploads have completed and URLs replaced
    console.log("[POST /api/ideas/create] All uploads complete. Inserting into database...");

    let idea;
    try {
      idea = await prisma.ideas.create({
        data: {
          title: titleTrimmed,
          description: finalDescription,
          uploadedImages: finalUploadedImages,
          userId,
          createdAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      });

      console.log(`[POST /api/ideas/create] ✅ Idea created successfully: ${idea.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[POST /api/ideas/create] ❌ Database insert failed:", errorMsg);
      return NextResponse.json(
        { error: `Failed to save idea: ${errorMsg}` },
        { status: 500 }
      );
    }

    // ============================================================
    // STEP 9: Return Success
    // ============================================================
    console.log("[POST /api/ideas/create] ✅ Idea creation workflow complete");

    return NextResponse.json(
      {
        success: true,
        data: idea,
        message: "Idea created successfully! 🎉",
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/ideas/create] ❌ Unexpected error:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
