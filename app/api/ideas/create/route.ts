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
import { extractUploadAndRemoveImages } from "@/lib/utils/lexical-image-extractor";
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

    // ============================================================
    // STEP 4: Extract, Upload, and Remove Images from Lexical JSON
    // ============================================================
    let extractedImageUrls: string[] = [];
    let cleanedDescriptionString: string;
    
    try {
      const result = await extractUploadAndRemoveImages(descriptionString, userId);
      extractedImageUrls = result.imageUrls;
      cleanedDescriptionString = result.cleanedDescriptionString;
      
      console.log(`[POST /api/ideas/create] ✅ Extracted and uploaded ${extractedImageUrls.length} images from editor`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[POST /api/ideas/create] ❌ Image extraction failed:", errorMsg);
      return NextResponse.json(
        { error: `Failed to process editor images: ${errorMsg}` },
        { status: 500 }
      );
    }

    // ============================================================
    // STEP 5: Combine All Uploaded Images
    // ============================================================
    // Merge extracted images from editor with manually uploaded files
    const manuallyUploadedImages = body.uploadedImageUrls || [];
    const finalUploadedImages = [...extractedImageUrls, ...manuallyUploadedImages];
    
    console.log(`[POST /api/ideas/create] 📸 Total images: ${finalUploadedImages.length} (${extractedImageUrls.length} from editor, ${manuallyUploadedImages.length} manual uploads)`);
    
    // ============================================================
    // STEP 6: Parse Cleaned Description
    // ============================================================
    let finalDescription: any;
    try {
      finalDescription = JSON.parse(cleanedDescriptionString);
    } catch (error) {
      console.error("[POST /api/ideas/create] ❌ Failed to parse cleaned description:", error);
      return NextResponse.json(
        { error: "Failed to finalize description" },
        { status: 500 }
      );
    }

    // ============================================================
    // STEP 7: CREATE IDEA IN DATABASE
    // ============================================================
    // CRITICAL: Only insert AFTER all uploads have completed and images removed from Lexical JSON
 
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

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[POST /api/ideas/create] ❌ Database insert failed:", errorMsg);
      return NextResponse.json(
        { error: `Failed to save idea: ${errorMsg}` },
        { status: 500 }
      );
    }

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
