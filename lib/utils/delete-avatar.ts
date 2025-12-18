/**
 * Avatar Deletion Utility - Supabase Storage
 * 
 * Handles cleanup of old avatar files from Supabase Storage.
 * Should be called when a user uploads a new avatar or deletes their account.
 * 
 * Security: Uses server-side client to ensure proper permissions
 */

"use server";

import { supabaseServer } from "@/lib/supabase/server";

const BUCKET_NAME = "avatar";

interface DeleteAvatarResult {
  success: boolean;
  error?: string;
}

/**
 * Delete avatar file from Supabase Storage
 * 
 * @param path - The storage path of the file to delete (e.g., "userId/timestamp-filename.jpg")
 * @returns Promise with deletion result
 * 
 * @example
 * ```ts
 * const result = await deleteAvatar("user123/1234567890-avatar.jpg");
 * if (result.success) {
 *   console.log("Avatar deleted successfully");
 * }
 * ```
 */
export async function deleteAvatar(path: string): Promise<DeleteAvatarResult> {
  try {
    if (!path || path.trim() === "") {
      return {
        success: false,
        error: "Invalid file path",
      };
    }

    // Remove the file from storage
    const { error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error("Supabase delete error:", error);
      
      // Handle specific errors
      if (error.message.includes("not found")) {
        // File already deleted or doesn't exist - not a critical error
        return {
          success: true, // Return success since the file is gone anyway
        };
      }

      return {
        success: false,
        error: error.message || "Failed to delete file",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Avatar deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Delete all avatars for a user
 * Useful for account deletion or cleanup
 * 
 * @param userId - The user ID whose avatars should be deleted
 * @returns Promise with deletion result
 */
export async function deleteAllUserAvatars(userId: string): Promise<DeleteAvatarResult> {
  try {
    if (!userId || userId.trim() === "") {
      return {
        success: false,
        error: "Invalid user ID",
      };
    }

    // List all files in the user's avatar folder
    const { data: files, error: listError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (listError) {
      console.error("Error listing files:", listError);
      return {
        success: false,
        error: listError.message || "Failed to list user files",
      };
    }

    if (!files || files.length === 0) {
      // No files to delete
      return {
        success: true,
      };
    }

    // Create array of file paths to delete
    const filePaths = files.map((file) => `${userId}/${file.name}`);

    // Delete all files
    const { error: deleteError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting files:", deleteError);
      return {
        success: false,
        error: deleteError.message || "Failed to delete user files",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Batch avatar deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Extract storage path from Supabase public URL
 * Helper function to get the path from a full URL
 * 
 * @param url - The public URL from Supabase
 * @returns The storage path or null if invalid
 * 
 * @example
 * ```ts
 * const url = "https://project.supabase.co/storage/v1/object/public/avatar/user123/avatar.jpg";
 * const path = extractPathFromUrl(url);
 * // Returns: "user123/avatar.jpg"
 * ```
 */
export async function extractPathFromUrl(url: string): Promise<string | null> {
  try {
    // Match pattern: /avatar/path/to/file.jpg (bucket name is 'avatar' not 'avatars')
    const match = url.match(/\/avatar\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting path from URL:", error);
    return null;
  }
}
