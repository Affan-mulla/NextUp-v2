/**
 * Image Upload Component
 * Handles file input and drag-and-drop for image uploads
 * Includes preview of selected images
 */

"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

interface PreviewImage {
  file: File;
  preview: string;
  id: string;
}

/**
 * Image upload component with drag-and-drop and preview
 */
export const ImageUpload = ({
  onImagesSelected,
  disabled = false,
  maxFiles = 10,
  maxSizePerFile = 5, // 5MB
}: ImageUploadProps) => {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate and process files
  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      setIsLoading(true);
      const maxSizeBytes = maxSizePerFile * 1024 * 1024;
      const validFiles: File[] = [];
      const newPreviews: PreviewImage[] = [];

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          return;
        }

        // Validate file size
        if (file.size > maxSizeBytes) {
          toast.error(
            `${file.name} exceeds ${maxSizePerFile}MB limit`
          );
          return;
        }

        validFiles.push(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            file,
            preview: reader.result as string,
            id: `${file.name}-${Date.now()}`,
          });

          // Update state when all files are processed
          if (newPreviews.length === validFiles.length) {
            const totalImages = previews.length + newPreviews.length;
            if (totalImages > maxFiles) {
              toast.error(
                `Maximum ${maxFiles} images allowed`
              );
              setIsLoading(false);
              return;
            }

            setPreviews((prev) => [...prev, ...newPreviews]);
            onImagesSelected([...previews.map((p) => p.file), ...validFiles]);
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(file);
      });

      if (validFiles.length === 0) {
        setIsLoading(false);
      }
    },
    [previews, onImagesSelected, disabled, maxFiles, maxSizePerFile]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
    },
    [processFiles]
  );

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [disabled]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [disabled]);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles, disabled]
  );

  // Remove preview
  const removePreview = useCallback((id: string) => {
    setPreviews((prev) => prev.filter((p) => p.id !== id));
    const remaining = previews.filter((p) => p.id !== id);
    onImagesSelected(remaining.map((p) => p.file));
  }, [previews, onImagesSelected]);

  // Clear all previews
  const clearAll = useCallback(() => {
    setPreviews([]);
    onImagesSelected([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImagesSelected]);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Idea Images (Optional)</Label>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        onClick={disabled ? undefined : openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={disabled || isLoading}
          className="hidden"
          aria-label="Upload images"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging
                ? "Drop images here"
                : "Drag and drop images here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WebP up to {maxSizePerFile}MB each
          </p>
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Selected Images ({previews.length}/{maxFiles})
            </p>
            {previews.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={disabled || isLoading}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {previews.map((preview) => (
              <div
                key={preview.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-input bg-muted"
              >
                <Image
                  src={preview.preview}
                  alt={preview.file.name}
                  fill
                  className="object-cover"
                />

                {/* Overlay with remove button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removePreview(preview.id)}
                    disabled={disabled || isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File name tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white truncate opacity-0 transition-opacity group-hover:opacity-100">
                  {preview.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
