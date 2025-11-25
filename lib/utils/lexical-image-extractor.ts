/**
 * Lexical Image Extractor Utility
 * Extracts, uploads, and removes images from Lexical JSON editor content
 * Production-ready for large documents with proper error handling
 */

import { createClient } from "@supabase/supabase-js";
import type { ImageExtractionResult } from "@/types/lexical-json";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "ideas";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

// Types
interface LexicalNode {
  type: string;
  src?: string;
  children?: LexicalNode[];
  [key: string]: any;
}

interface LexicalEditorState {
  root: LexicalNode;
}

interface ExtractedImage {
  src: string;
  mimeType: string;
  isBase64: boolean;
}

/**
 * Check if a string is a base64 image
 */
function isBase64Image(src: string): boolean {
  return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(src);
}

/**
 * Check if a string is an external image URL
 */
function isExternalImageUrl(src: string): boolean {
  return /^https?:\/\//.test(src);
}

/**
 * Extract MIME type from base64 string
 */
function getMimeTypeFromBase64(base64: string): string {
  const match = base64.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : "image/jpeg";
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const base64Data = base64.split(",")[1];
  const byteCharacters = atob(base64Data);
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
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Validate image size (for base64 images)
 */
function validateImageSize(base64: string): boolean {
  try {
    const base64Data = base64.split(",")[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes <= MAX_FILE_SIZE;
  } catch {
    return false;
  }
}

/**
 * Validate MIME type
 */
function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Upload a single base64 image to Supabase
 */
async function uploadBase64Image(
  base64: string,
  userId: string
): Promise<string> {
  const mimeType = getMimeTypeFromBase64(base64);

  // Validate MIME type
  if (!validateMimeType(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }

  // Validate size
  if (!validateImageSize(base64)) {
    throw new Error(`Image exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  try {
    const blob = base64ToBlob(base64, mimeType);
    const filename = generateImageFilename(mimeType);
    const path = `${userId}/editor/${filename}`;

    const { data: uploadData, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    if (!uploadData || !uploadData.path) {
      throw new Error("No upload data returned from Supabase");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL from Supabase");
    }

    console.log(`[lexical-image-extractor] ✅ Uploaded image: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[lexical-image-extractor] ❌ Upload failed:`, errorMsg);
    throw error;
  }
}

/**
 * Recursively extract all images from Lexical JSON
 * Returns array of extracted images (includes base64 and external URLs)
 */
function extractImagesFromLexicalNode(
  node: LexicalNode,
  extractedImages: ExtractedImage[] = []
): ExtractedImage[] {
  // Check if this node is an image node
  if (node.type === "image" && node.src) {
    const src = node.src;
    
    if (isBase64Image(src)) {
      extractedImages.push({
        src,
        mimeType: getMimeTypeFromBase64(src),
        isBase64: true,
      });
    } else if (isExternalImageUrl(src)) {
      // Skip external URLs - we only process base64 and remove nodes
      console.log(`[lexical-image-extractor] ℹ️ Found external image URL (will be removed): ${src.substring(0, 100)}...`);
    }
  }

  // Recursively process children
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractImagesFromLexicalNode(child, extractedImages);
    }
  }

  return extractedImages;
}

/**
 * Recursively remove all image nodes from Lexical JSON
 * Returns a new cleaned node structure
 */
function removeImageNodesFromLexical(node: LexicalNode): LexicalNode | null {
  // If this is an image node, remove it
  if (node.type === "image") {
    return null;
  }

  // Create a shallow copy of the node
  const cleanedNode: LexicalNode = { ...node };

  // Recursively clean children
  if (node.children && Array.isArray(node.children)) {
    const cleanedChildren = node.children
      .map((child) => removeImageNodesFromLexical(child))
      .filter((child): child is LexicalNode => child !== null); // Remove null values

    cleanedNode.children = cleanedChildren;
  }

  return cleanedNode;
}

/**
 * Main function: Extract, upload, and remove images from Lexical JSON
 * 
 * @param descriptionString - JSON stringified Lexical editor state
 * @param userId - User ID for organizing uploaded images in Supabase
 * @returns Object with imageUrls array and cleaned description string (no image nodes)
 * 
 * @example
 * const result = await extractUploadAndRemoveImages(editorContent, "user-123");
 * // result.imageUrls: ["https://...", "https://..."]
 * // result.cleanedDescriptionString: JSON string with NO image nodes
 */
export async function extractUploadAndRemoveImages(
  descriptionString: string,
  userId: string
): Promise<ImageExtractionResult> {
  console.log(`[lexical-image-extractor] 🚀 Starting image extraction for user: ${userId}`);

  try {
    // Step 1: Parse the Lexical JSON
    let lexicalData: LexicalEditorState;
    try {
      lexicalData =
        typeof descriptionString === "string"
          ? JSON.parse(descriptionString)
          : descriptionString;
    } catch (error) {
      throw new Error("Invalid Lexical JSON format");
    }

    if (!lexicalData.root) {
      throw new Error("Invalid Lexical structure: missing root node");
    }

    // Step 2: Extract all images recursively
    const extractedImages = extractImagesFromLexicalNode(lexicalData.root);
    console.log(`[lexical-image-extractor] 📸 Found ${extractedImages.length} base64 images to upload`);

    // Step 3: Upload all base64 images concurrently
    let uploadedUrls: string[] = [];
    
    if (extractedImages.length > 0) {
      try {
        const uploadPromises = extractedImages.map((image) =>
          uploadBase64Image(image.src, userId)
        );

        uploadedUrls = await Promise.all(uploadPromises);
        console.log(`[lexical-image-extractor] ✅ Successfully uploaded ${uploadedUrls.length} images`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[lexical-image-extractor] ❌ Upload batch failed:`, errorMsg);
        throw new Error(`Failed to upload images: ${errorMsg}`);
      }
    }

    // Step 4: Remove ALL image nodes from Lexical structure
    const cleanedRoot = removeImageNodesFromLexical(lexicalData.root);
    
    if (!cleanedRoot) {
      throw new Error("Cleaning process resulted in null root node");
    }

    const cleanedData: LexicalEditorState = {
      root: cleanedRoot,
    };

    // Step 5: Stringify the cleaned Lexical JSON
    const cleanedDescriptionString = JSON.stringify(cleanedData);

    // Step 6: Verify no image nodes remain
    const remainingImages = extractImagesFromLexicalNode(cleanedData.root);
    if (remainingImages.length > 0) {
      console.warn(`[lexical-image-extractor] ⚠️ Warning: ${remainingImages.length} images still present after cleaning`);
    } else {
      console.log(`[lexical-image-extractor] ✅ All image nodes successfully removed from Lexical JSON`);
    }

    console.log(`[lexical-image-extractor] 🎉 Process complete: ${uploadedUrls.length} images uploaded, content cleaned`);

    return {
      imageUrls: uploadedUrls,
      cleanedDescriptionString,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[lexical-image-extractor] ❌ Fatal error:`, errorMsg);
    throw new Error(`Image extraction failed: ${errorMsg}`);
  }
}

/**
 * Utility function to check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey);
}
