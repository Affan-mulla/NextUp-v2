/**
 * Create Idea Form Component
 * Main form component with title input, rich text editor, and image upload
 * Handles form submission with validation and progress tracking
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SerializedEditorState } from "lexical";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { useCreateIdea } from "@/hooks/useCreateIdea";
import { CreateIdeaFormSchema, CreateIdeaFormData } from "@/lib/validation/idea-validation";

// Initial empty Lexical editor state
const INITIAL_EDITOR_STATE: SerializedEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

interface CreateIdeaFormProps {
  onSuccessRedirect?: string;
  onSuccess?: (ideaId: string) => void;
}

/**
 * CreateIdeaForm Component
 * Production-ready form for creating ideas with images
 */
export const CreateIdeaForm = ({
  onSuccessRedirect,
  onSuccess,
}: CreateIdeaFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CreateIdeaFormData>({
    resolver: zodResolver(CreateIdeaFormSchema) as any,
    defaultValues: {
      title: "",
      description: INITIAL_EDITOR_STATE,
      uploadedImages: [],
    },
    mode: "onBlur",
  });

  const { createIdea, isLoading, progress, isUploadingImages } =
    useCreateIdea();

  const [editorState, setEditorState] = useState<SerializedEditorState>(
    INITIAL_EDITOR_STATE
  );
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  // Watch title for real-time validation
  const titleValue = watch("title");
  const remainingChars = 200 - titleValue.length;

  // Handle form submission
  const onSubmit = useCallback(
    async (data: any) => {
      const result = await createIdea({
        title: data.title,
        description: editorState,
        uploadedImages,
      });

      if (result.success && result.data) {
        // Reset form
        reset();
        setEditorState(INITIAL_EDITOR_STATE);
        setUploadedImages([]);

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess(result.data.id);
        } else if (onSuccessRedirect) {
          window.location.href = onSuccessRedirect;
        }
      }
    },
    [createIdea, editorState, uploadedImages, reset, onSuccess, onSuccessRedirect]
  );

  // Handle images selected
  const handleImagesSelected = useCallback((files: File[]) => {
    setUploadedImages(files);
  }, []);

  // Disable form while submitting
  const isFormDisabled = isSubmitting || isLoading || isUploadingImages;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border border-input bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl font-semibold">Create New Idea</span>
              {isLoading && (
                <div className="ml-auto">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <Label htmlFor="idea-title" className="text-sm font-medium">
                  Idea Title
                </Label>
                <span
                  className={`text-xs ${
                    remainingChars < 20
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {remainingChars} characters remaining
                </span>
              </div>

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="idea-title"
                    placeholder="Enter an engaging title for your idea..."
                    disabled={isFormDisabled}
                    className="h-10"
                    maxLength={200}
                  />
                )}
              />

              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Label htmlFor="idea-description" className="text-sm font-medium">
                Description
              </Label>

              <div>
                <RichTextEditor
                  value={editorState}
                  onChange={setEditorState}
                  placeholder="Describe your idea in detail. You can add images directly in the editor..."
                  disabled={isFormDisabled}
                />
              </div>

              {errors.description && (
                <p className="text-xs text-destructive">
                  {String(errors.description.message)}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                💡 Pro tip: You can paste or drag images directly into the
                editor
              </p>
            </div>

            {/* Image Upload Section */}
            <div>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                disabled={isFormDisabled}
                maxFiles={10}
                maxSizePerFile={5}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                These images will be stored separately from editor images
              </p>
            </div>

            {/* Progress Indicator */}
            {isLoading && (
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {progress.stage === "uploading-images"
                      ? "Uploading images..."
                      : progress.stage === "submitting"
                        ? "Creating your idea..."
                        : "Processing..."}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {progress.current} of {progress.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error Summary */}
            {(errors.title || errors.description) && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {errors.title && <li>{String(errors.title.message)}</li>}
                  {errors.description && <li>{String(errors.description.message)}</li>}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="flex-1"
                size="lg"
              >
                {isFormDisabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImages ? "Uploading Images..." : "Creating Idea..."}
                  </>
                ) : (
                  "Create Idea"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  reset();
                  setEditorState(INITIAL_EDITOR_STATE);
                  setUploadedImages([]);
                }}
                disabled={isFormDisabled}
              >
                Reset
              </Button>
            </div>

            {/* Help Text */}
            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-2">
              <p>
                <strong>💾 Tip:</strong> Your idea is automatically saved to our
                database with all images uploaded to secure cloud storage.
              </p>
              <p>
                <strong>🔒 Privacy:</strong> Only you can edit your ideas. You
                can always update or delete them later.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
