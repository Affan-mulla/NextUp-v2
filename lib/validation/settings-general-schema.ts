import { z } from "zod";

/**
 * Validation schema for general settings form
 * 
 * Validates user profile updates including:
 * - Name (display name)
 * - Username (unique identifier for profile URLs)
 * - Bio (optional description)
 * - Avatar (optional image file)
 */

export const generalSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Username must be lowercase and contain only letters, numbers, hyphens, and underscores"
    )
    .trim()
    .toLowerCase(),
  
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  
  avatar: z
    .string()
    .url("Invalid avatar URL")
    .optional()
    .or(z.literal("")),
});

/**
 * Type inference from schema
 */
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

/**
 * Client-side file validation for avatar uploads
 * Used before uploading to prevent invalid files
 */
export const avatarFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 4 * 1024 * 1024, "File size must be less than 4MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type),
      "Only JPG, PNG, WebP, and SVG files are allowed"
    ),
});

export type AvatarFileInput = z.infer<typeof avatarFileSchema>;
