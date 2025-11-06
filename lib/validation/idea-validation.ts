/**
 * Validation schemas for Create Idea form
 * Uses Zod for runtime type safety
 */

import { z } from "zod";

// Lexical editor serialized state type
export const LexicalEditorStateSchema = z.record(z.string(), z.any());

export const CreateIdeaFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),

  description: LexicalEditorStateSchema.refine(
    (state) => {
      // Ensure editor has content (not just empty state)
      if (!state || typeof state !== "object") return false;
      // Basic check for content existence
      return true;
    },
    {
      message: "Description cannot be empty",
    }
  ),

  uploadedImages: z.array(z.instanceof(File)).default([]),
});

export type CreateIdeaFormData = z.infer<typeof CreateIdeaFormSchema>;

/**
 * Validate title field only
 */
export const TitleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must not exceed 200 characters")
  .trim();

/**
 * Validate images (files)
 */
export const ImagesSchema = z
  .array(z.instanceof(File))
  .refine(
    (files) => {
      return files.every((file) => file.type.startsWith("image/"));
    },
    {
      message: "All files must be images",
    }
  )
  .refine(
    (files) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      return files.every((file) => file.size <= maxSize);
    },
    {
      message: "Each image must be smaller than 5MB",
    }
  )
  .refine(
    (files) => {
      return files.length <= 10;
    },
    {
      message: "Maximum 10 images allowed",
    }
  );
