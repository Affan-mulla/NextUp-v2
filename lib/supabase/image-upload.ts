/**
 * Supabase Image Upload Utilities
 * Handles uploading base64 images and files to Supabase Storage
 * Uses Promise.all() for concurrent uploads and guaranteed await completion
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "ideas";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

/**
 * Extract base64 images from editor content
 * Supports img tags with data:image/... format
 */
function extractBase64Images(
  content: string
): Array<{ base64: string; mimeType: string }> {
  const base64ImageRegex =
    /(data:image\/(png|jpeg|jpg|gif|webp);base64,([a-zA-Z0-9+/=]+))/g;
  const matches = Array.from(content.matchAll(base64ImageRegex));

  return matches.map((match) => ({
    base64: match[1],
    mimeType: `image/${match[2]}`,
  }));
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Generate unique filename for uploaded images
 */
function generateImageFilename(mimeType: string): string {
  const extension = mimeType.split("/")[1] || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Upload base64 images from editor content to Supabase concurrently
 * Returns mapping of base64 data URLs to Supabase public URLs
 * ⚠️ IMPORTANT: This function returns a Promise. Always await it before database insert.
 */
export async function uploadBase64ImagesToSupabase(
  editorContent: string,
  userId: string
): Promise<Map<string, string>> {
  const imageMapping = new Map<string, string>();
  const base64Images = extractBase64Images(editorContent);

  if (base64Images.length === 0) {
    console.log("[uploadBase64ImagesToSupabase] No base64 images found");
    return imageMapping;
  }

  console.log(`[uploadBase64ImagesToSupabase] Found ${base64Images.length} base64 images to upload`);

  try {
    // Use Promise.all() for concurrent uploads instead of sequential for loop
    const uploadPromises = base64Images.map(async (image) => {
      try {
        const blob = base64ToBlob(image.base64, image.mimeType);
        const filename = generateImageFilename(image.mimeType);
        const path = `${userId}/editor/${filename}`;

        console.log(`[uploadBase64ImagesToSupabase] Uploading: ${path}`);

        const { data: uploadData, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(path, blob, {
            contentType: image.mimeType,
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed for ${path}: ${error.message}`);
        }

        if (!uploadData || !uploadData.path) {
          throw new Error(`No upload data returned for ${path}`);
        }

        // Get and verify public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(path);

        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL for ${path}`);
        }

        console.log(`[uploadBase64ImagesToSupabase] ✅ Uploaded successfully: ${urlData.publicUrl}`);

        return {
          base64: image.base64,
          supabaseUrl: urlData.publicUrl,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[uploadBase64ImagesToSupabase] ❌ Error uploading image:`, errorMsg);
        throw error;
      }
    });

    // Wait for ALL uploads to complete before proceeding
    const results = await Promise.all(uploadPromises);

    // Build the mapping
    results.forEach(({ base64, supabaseUrl }) => {
      imageMapping.set(base64, supabaseUrl);
    });

    console.log(`[uploadBase64ImagesToSupabase] ✅ All ${results.length} uploads completed`);
    return imageMapping;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[uploadBase64ImagesToSupabase] ❌ Fatal error:", errorMsg);
    throw new Error(`Failed to upload base64 images: ${errorMsg}`);
  }
}

/**
 * Replace base64 image URLs with Supabase public URLs in content
 */
export function replaceBase64WithSupabaseUrls(
  content: string,
  imageMapping: Map<string, string>
): string {
  let updatedContent = content;

  for (const [base64Url, supabaseUrl] of imageMapping.entries()) {
    // Escape special regex characters in base64 URL
    const escapedBase64 = base64Url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedBase64, "g");
    updatedContent = updatedContent.replace(regex, supabaseUrl);
  }

  return updatedContent;
}

/**
 * Upload individual image files to Supabase concurrently
 * Returns array of public URLs
 * ⚠️ IMPORTANT: This function returns a Promise. Always await it before database insert.
 */
export async function uploadFilesToSupabase(
  files: File[],
  userId: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  if (files.length === 0) {
    console.log("[uploadFilesToSupabase] No files to upload");
    return uploadedUrls;
  }

  if (files.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} files allowed`);
  }

  console.log(`[uploadFilesToSupabase] Starting upload of ${files.length} files`);

  try {
    // Validate all files first
    const validatedFiles = files.filter((file) => {
      // Check file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        console.warn(`[uploadFilesToSupabase] ⚠️ Skipping: Invalid mime type ${file.type}`);
        return false;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`[uploadFilesToSupabase] ⚠️ Skipping: File ${file.name} exceeds 5MB`);
        return false;
      }

      return true;
    });

    if (validatedFiles.length === 0) {
      throw new Error("No valid image files found");
    }

    // Use Promise.all() for concurrent uploads instead of sequential for loop
    const uploadPromises = validatedFiles.map(async (file) => {
      try {
        const filename = generateImageFilename(file.type);
        const path = `${userId}/uploads/${filename}`;

        console.log(`[uploadFilesToSupabase] Uploading: ${path}`);

        const { data: uploadData, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          throw new Error(`Upload failed for ${file.name}: ${error.message}`);
        }

        if (!uploadData || !uploadData.path) {
          throw new Error(`No upload data returned for ${file.name}`);
        }

        // Get and verify public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(path);

        if (!urlData?.publicUrl) {
          throw new Error(`Failed to get public URL for ${file.name}`);
        }

        console.log(`[uploadFilesToSupabase] ✅ Uploaded: ${file.name} -> ${urlData.publicUrl}`);

        return urlData.publicUrl;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[uploadFilesToSupabase] ❌ Error uploading ${file.name}:`, errorMsg);
        throw error;
      }
    });

    // Wait for ALL uploads to complete before proceeding
    const results = await Promise.all(uploadPromises);

    console.log(`[uploadFilesToSupabase] ✅ All ${results.length} file uploads completed`);

    return results;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[uploadFilesToSupabase] ❌ Fatal error:", errorMsg);
    throw new Error(`Failed to upload files: ${errorMsg}`);
  }
}

/**
 * Utility to check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey);
}
