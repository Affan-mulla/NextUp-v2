/**
 * Avatar Upload Utility - API Route Upload
 * 
 * Client-side utility that uploads avatars through a Next.js API route.
 * 
 * Architecture:
 * - Client validates file (instant feedback)
 * - Sends file to /api/upload/avatar
 * - API route validates BetterAuth session
 * - API route uploads to Supabase using service role key (bypasses RLS)
 * - Returns public URL
 * 
 * Why this approach:
 * - BetterAuth session ≠ Supabase Auth JWT
 * - auth.jwt() in RLS policies won't work with BetterAuth
 * - Service role key bypasses RLS safely when used server-side
 * - Client never has access to service role key
 */

import { avatarFileSchema } from "@/lib/validation/settings-general-schema";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

interface UploadAvatarResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload avatar file through API route
 * 
 * @param file - The image file to upload
 * @returns Promise with upload result containing URL or error
 * 
 * @example
 * ```ts
 * const result = await uploadAvatar(file);
 * if (result.success) {
 *   console.log("Uploaded to:", result.url);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
  try {
    // 1. Client-side validation for instant feedback
    const validation = avatarFileSchema.safeParse({ file });
    
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Invalid file";
      return {
        success: false,
        error: errorMessage,
      };
    }

    // 2. Additional validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Only JPG, PNG, WebP, and SVG files are allowed",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File size must be less than 4MB",
      };
    }

    // 3. Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);

    // 4. Upload via API route (handles BetterAuth session + Supabase upload)
    const response = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
      // Headers are automatically set for FormData
      // BetterAuth session cookie is sent automatically
    });

    const data: UploadAvatarResult = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Upload failed with status ${response.status}`,
      };
    }

    if (!data.success || !data.url) {
      return {
        success: false,
        error: data.error || "Upload failed - no URL returned",
      };
    }

    return {
      success: true,
      url: data.url,
      path: data.path,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Validate avatar file size and type on client
 * Use this for instant feedback before upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  const validation = avatarFileSchema.safeParse({ file });
  
  if (!validation.success) {
    return {
      valid: false,
      error: validation.error.issues[0]?.message || "Invalid file",
    };
  }
  
  return { valid: true };
}
