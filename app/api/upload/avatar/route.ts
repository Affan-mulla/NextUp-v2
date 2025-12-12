/**
 * Avatar Upload API Route
 * 
 * Handles secure avatar uploads using BetterAuth session validation
 * and Supabase Storage with service role key (bypasses RLS).
 * 
 * Architecture:
 * 1. Validate BetterAuth session (not Supabase Auth)
 * 2. Accept file via FormData
 * 3. Upload to Supabase using service role key (bypasses RLS)
 * 4. Return public URL
 * 
 * Security:
 * - BetterAuth validates user identity
 * - Service role key stays on server (never exposed to client)
 * - RLS bypassed safely because authentication happens here
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { supabaseServer } from "@/lib/supabase/server";

const BUCKET_NAME = "avatar";
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "svg"];

interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // 1. Authenticate user with BetterAuth (not Supabase Auth)
    const session = await auth.api.getSession({ 
      headers: request.headers as any 
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized. Please sign in." 
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No file provided" 
        },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file type. Only JPG, PNG, WebP, and SVG are allowed." 
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: "File size exceeds 4MB limit" 
        },
        { status: 400 }
      );
    }

    // 5. Validate file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file extension" 
        },
        { status: 400 }
      );
    }

    // 6. Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = `${userId}/${fileName}`;

    // 7. Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 8. Upload to Supabase Storage using SERVICE ROLE KEY
    // This bypasses RLS because service role has admin privileges
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      
      // Handle specific errors
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Storage bucket not configured. Please contact support." 
          },
          { status: 500 }
        );
      }

      if (uploadError.message.includes("already exists")) {
        return NextResponse.json(
          { 
            success: false, 
            error: "File already exists. Please try again." 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: uploadError.message || "Upload failed" 
        },
        { status: 500 }
      );
    }

    if (!uploadData?.path) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Upload completed but no path returned" 
        },
        { status: 500 }
      );
    }

    // 9. Get public URL
    const { data: urlData } = supabaseServer.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to generate public URL" 
        },
        { status: 500 }
      );
    }

    // 10. Return success response
    return NextResponse.json(
      {
        success: true,
        url: urlData.publicUrl,
        path: uploadData.path,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Avatar upload API error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check bucket configuration
export async function GET(): Promise<NextResponse> {
  try {
    // Check if bucket exists
    const { data, error } = await supabaseServer.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      return NextResponse.json(
        { 
          configured: false, 
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        configured: true, 
        bucket: data.name,
        public: data.public 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        configured: false, 
        error: "Failed to check bucket" 
      },
      { status: 500 }
    );
  }
}
