/**
 * useCreateIdea Hook
 * Manages the complete flow of creating an idea including image uploads
 */

"use client";

import { useCallback, useState } from "react";
import { SerializedEditorState } from "lexical";
import { toast } from "sonner";
import axios from "axios";
import {
  uploadFilesToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/image-upload";
import { authClient } from "@/lib/auth/auth-client";

interface CreateIdeaPayload {
  title: string;
  description: SerializedEditorState;
  uploadedImages: File[];
}

interface CreateIdeaResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface UseCreateIdeaState {
  isLoading: boolean;
  isUploadingImages: boolean;
  progress: {
    current: number;
    total: number;
    stage: "idle" | "uploading-images" | "submitting" | "complete";
  };
}

/**
 * Hook for managing idea creation with image uploads
 */
export const useCreateIdea = () => {
  const [state, setState] = useState<UseCreateIdeaState>({
    isLoading: false,
    isUploadingImages: false,
    progress: {
      current: 0,
      total: 0,
      stage: "idle",
    },
  });

  /**
   * Create an idea with all associated media
   * CRITICAL: Images must be uploaded BEFORE this function is called
   * This function sends the URLs to the API, not the actual files
   */
  const createIdea = useCallback(
    async (payload: CreateIdeaPayload): Promise<CreateIdeaResponse> => {
      // Validate inputs
      if (!payload.title || !payload.title.trim()) {
        const errMsg = "Please enter an idea title";
        console.error("[useCreateIdea]", errMsg);
        toast.error(errMsg);
        return { success: false, error: "Title is required" };
      }

      if (!payload.description) {
        const errMsg = "Please enter an idea description";
        console.error("[useCreateIdea]", errMsg);
        toast.error(errMsg);
        return { success: false, error: "Description is required" };
      }

      if (!isSupabaseConfigured()) {
        const errMsg = "Supabase is not configured";
        console.error("[useCreateIdea]", errMsg);
        toast.error(errMsg);
        return {
          success: false,
          error: "Supabase configuration missing",
        };
      }

      try {
        console.log("[useCreateIdea] Starting idea creation workflow...");

        // ============================================================
        // STEP 1: Check authentication
        // ============================================================
        console.log("[useCreateIdea] Checking authentication...");
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          const errMsg = "Please log in to create ideas";
          console.error("[useCreateIdea]", errMsg);
          toast.error(errMsg);
          return { success: false, error: "User not authenticated" };
        }
        console.log(`[useCreateIdea] ✅ Authenticated: ${session.user.id}`);

        // ============================================================
        // STEP 2: Upload manually selected images
        // ============================================================
        setState((prev) => ({
          ...prev,
          isLoading: true,
          progress: { current: 1, total: 3, stage: "uploading-images" },
        }));

        let uploadedImageUrls: string[] = [];
        if (payload.uploadedImages.length > 0) {
          console.log(`[useCreateIdea] Uploading ${payload.uploadedImages.length} image files...`);
          setState((prev) => ({
            ...prev,
            isUploadingImages: true,
          }));

          const toastId = toast.loading(
            `Uploading ${payload.uploadedImages.length} image${
              payload.uploadedImages.length === 1 ? "" : "s"
            }...`
          );

          try {
            uploadedImageUrls = await uploadFilesToSupabase(
              payload.uploadedImages,
              session.user.id
            );
            console.log(`[useCreateIdea] ✅ Image upload complete: ${uploadedImageUrls.length} URLs`);
            toast.dismiss(toastId);
          } catch (error) {
            toast.dismiss(toastId);
            const errorMsg =
              error instanceof Error ? error.message : "Failed to upload images";
            console.error("[useCreateIdea] ❌ Image upload failed:", errorMsg);
            toast.error(errorMsg);
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isUploadingImages: false,
              progress: { current: 0, total: 0, stage: "idle" },
            }));
            return {
              success: false,
              error: "Image upload failed",
            };
          }

          setState((prev) => ({
            ...prev,
            isUploadingImages: false,
          }));
        }

        // ============================================================
        // STEP 3: Update progress and send to API
        // ============================================================
        console.log("[useCreateIdea] All image uploads complete. Submitting to API...");
        setState((prev) => ({
          ...prev,
          progress: { current: 2, total: 3, stage: "submitting" },
        }));

        const toastId = toast.loading("Creating your idea...");

        // CRITICAL: Send JSON stringified description + image URLs to API
        // The API will handle base64 extraction from the description
        const requestPayload = {
          title: payload.title.trim(),
          description: JSON.stringify(payload.description),
          uploadedImageUrls,
        };

        console.log("[useCreateIdea] Sending request to API:", {
          title: requestPayload.title,
          descriptionLength: requestPayload.description.length,
          uploadedImageCount: uploadedImageUrls.length,
        });

        const { data } = await axios.post<CreateIdeaResponse>(
          "/api/ideas/create",
          requestPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("[useCreateIdea] ✅ API response success:", data);

        // ============================================================
        // STEP 4: Complete and notify
        // ============================================================
        setState((prev) => ({
          ...prev,
          progress: { current: 3, total: 3, stage: "complete" },
        }));

        toast.dismiss(toastId);
        toast.success(data.message || "Idea created successfully! 🎉");

        console.log("[useCreateIdea] ✅ Idea creation complete!");

        // Reset state after a short delay
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            progress: { current: 0, total: 0, stage: "idle" },
          }));
        }, 1000);

        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } catch (error) {
        console.error("[useCreateIdea] ❌ Unexpected error:", error);
        toast.dismiss();
        
        let errorMessage = "An error occurred";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.error || error.message || "Failed to create idea";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isUploadingImages: false,
          progress: { current: 0, total: 0, stage: "idle" },
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  return {
    createIdea,
    ...state,
  };
};
