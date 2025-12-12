"use server";

import { prisma } from "@/lib/prisma";
import { generalSettingsSchema, type GeneralSettingsInput } from "@/lib/validation/settings-general-schema";
import { auth } from "@/lib/auth/auth";
import { deleteAvatar, extractPathFromUrl } from "@/lib/utils/delete-avatar";

/**
 * Server action response types
 */
export type ActionResponse<T = void> = 
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Update user general settings
 * 
 * Server action that validates and updates user profile information
 * including name, username, bio, and avatar.
 * 
 * @param formData - Form data containing user updates
 * @returns ActionResponse with success/error status
 * 
 * @example
 * ```ts
 * const result = await updateGeneralInfo(formData);
 * if (result.success) {
 *   toast.success(result.message);
 * } else {
 *   toast.error(result.error);
 * }
 * ```
 */
export async function updateGeneralInfo(
  input: Partial<GeneralSettingsInput>
): Promise<ActionResponse<{ user: { id: string; name: string; username: string; image: string | null } }>> {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ 
      headers: await import("next/headers").then(m => m.headers()) as any
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to update your profile.",
      };
    }

    const userId = session.user.id;

    // Validate only the fields that were provided (partial validation)
    const validation = generalSettingsSchema.partial().safeParse(input);
    
    if (!validation.success) {
      return {
        success: false,
        error: "Validation failed. Please check your input.",
        fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { name, username, bio, avatar } = validation.data;
    
    // Log what fields are being updated
    console.log("[Update] Fields being updated:", Object.keys(validation.data));

    // Check if username is already taken by another user (only if username is being changed)
    if (username !== undefined && username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          error: "Username is already taken",
          fieldErrors: {
            username: ["This username is already taken. Please choose another."],
          },
        };
      }
    }

    // Get current user data to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    // If user is uploading a new avatar and has an old one, delete the old one
    // This prevents storage bloat from accumulating old avatars
    if (avatar && currentUser?.image && currentUser.image !== avatar) {
      const oldAvatarPath = await extractPathFromUrl(currentUser.image);
      if (oldAvatarPath) {
        console.log("[Avatar Cleanup] Deleting old avatar:", oldAvatarPath);
        // Delete old avatar (don't await - fire and forget)
        // If deletion fails, it's not critical - we can clean up later
        deleteAvatar(oldAvatarPath).then((result) => {
          if (result.success) {
            console.log("[Avatar Cleanup] Successfully deleted old avatar:", oldAvatarPath);
          } else {
            console.warn("[Avatar Cleanup] Failed to delete old avatar:", oldAvatarPath, result.error);
          }
        }).catch((error) => {
          console.warn("[Avatar Cleanup] Deletion error:", error);
        });
      } else {
        console.warn("[Avatar Cleanup] Could not extract path from URL:", currentUser.image);
      }
    }

    // Build update data object with only changed fields
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio || null;
    if (avatar !== undefined) updateData.image = avatar || null;

    // Update user in database with only the changed fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    return {
      success: true,
      data: { user: updatedUser },
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("Update general info error:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Username is already taken",
          fieldErrors: {
            username: ["This username is already taken. Please choose another."],
          },
        };
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
