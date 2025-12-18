"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useUserActions } from "@/lib/store/user-store";
import { useInvalidateProfile } from "@/lib/hooks/useProfile";
import { generalSettingsSchema, type GeneralSettingsInput } from "@/lib/validation/settings-general-schema";
import { updateGeneralInfo } from "@/lib/actions/update-general-info";
import { uploadAvatar, validateAvatarFile } from "@/lib/utils/upload-avatar";

// UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

/**
 * GeneralSettingsForm Component
 * 
 * Production-grade form for updating user profile information.
 * Features:
 * - React Hook Form with Zod validation
 * - Avatar upload with preview
 * - Real-time validation feedback
 * - Optimistic UI updates
 * - Loading and error states
 * - Responsive design (2-column desktop, 1-column mobile)
 */
export default function GeneralSettingsForm() {
  const user = useUser();
  const { updateUser } = useUserActions();
  const invalidateProfile = useInvalidateProfile();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    },
  });

  const currentAvatar = watch("avatar");

  /**
   * Reset form when user data loads
   * Fixes issue where form fields are empty on first render after page refresh
   */
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, reset]);

  /**
   * Handle avatar file upload
   * Validates file, uploads via API route, and updates preview
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ensure user is loaded
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    // Client-side validation for instant feedback
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      // Upload file via API route (handles BetterAuth + Supabase)
      const result = await uploadAvatar(file);

      if (!result.success) {
        toast.error(result.error || "Upload failed");
        return;
      }

      // Update preview and form value
      setAvatarPreview(result.url!);
      setValue("avatar", result.url!, { shouldDirty: true });
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle form submission
   * Optimized: Only sends changed fields to reduce payload size
   */
  const onSubmit = async (data: GeneralSettingsInput) => {
    try {
      // Get dirty fields to send only what changed
      const dirtyFields = formState.dirtyFields;
      
      // Build optimized payload with only changed fields
      const changedData: Partial<GeneralSettingsInput> = {};
      
      if (dirtyFields.name) changedData.name = data.name;
      if (dirtyFields.username) changedData.username = data.username;
      if (dirtyFields.bio) changedData.bio = data.bio;
      if (dirtyFields.avatar) changedData.avatar = data.avatar;
      
      // If nothing changed, don't submit (shouldn't happen due to isDirty check)
      if (Object.keys(changedData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      console.log("[Form] Submitting changed fields:", Object.keys(changedData));
      
      const result = await updateGeneralInfo(changedData);

      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            messages.forEach((message) => {
              toast.error(message);
            });
          });
        } else {
          toast.error(result.error);
        }
        return;
      }

      // Optimistic UI update (instant feedback)
      const userUpdates: Partial<typeof user> = {};
      if (changedData.name !== undefined) userUpdates.name = changedData.name;
      if (changedData.username !== undefined) userUpdates.username = changedData.username;
      if (changedData.avatar !== undefined) userUpdates.avatar = changedData.avatar || undefined;
      
      updateUser(userUpdates);

      // Invalidate profile cache to refetch from DB (source of truth)
      invalidateProfile();

      toast.success(result.message);
      reset(data); // Reset form to new values (clears isDirty state)
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  /**
   * Handle form reset
   * Reverts to original user data
   */
  const handleReset = () => {
    reset({
      name: user?.name || "",
      username: user?.username || "",
      bio: "",
      avatar: user?.avatar || "",
    });
    setAvatarPreview(null);
    toast.info("Changes discarded");
  };

  // Show loading skeleton if user not loaded
  if (!user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* ---------- SECTION HEADER ---------- */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Personal info</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your photo and personal details here.
        </p>
      </div>

      {/* ---------- NAME & USERNAME FIELDS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Anon User"
            {...register("name")}
            className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username">
            Username <span className="text-destructive">*</span>
          </Label>
          <Input
            id="username"
            placeholder="anon123"
            {...register("username")}
            className={cn(errors.username && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used in your profile URL: /u/{watch("username") || "username"}
          </p>
        </div>
      </div>

      <Separator />

      {/* ---------- EMAIL (READ-ONLY) ---------- */}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          readOnly
          disabled
          className="bg-muted/50 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email can be changed in your account settings.
        </p>
      </div>

      <Separator />

      {/* ---------- AVATAR UPLOAD ---------- */}
      <div className="space-y-3">
        <Label>Your photo</Label>
        <p className="text-xs text-muted-foreground">
          This will be displayed on your profile and next to your posts.
        </p>

        <div className="flex items-start gap-6 flex-col sm:flex-row">
          {/* Avatar Preview */}
          <Avatar className="h-20 w-20 ring-2 ring-border/50">
            <AvatarImage 
              src={avatarPreview || currentAvatar || user.avatar} 
              alt={user.name}
            />
            <AvatarFallback className="text-lg">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Upload Box */}
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full max-w-md h-32 rounded-xl",
              "border-2 border-dashed border-border/60",
              "cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all duration-200",
              "hover:border-border/80",
              isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                <span className="text-sm font-medium text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="h-7 w-7 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-foreground">
                  Click to upload
                </span>
                <span className="text-xs text-muted-foreground mt-1 px-4 text-center">
                  SVG, PNG, JPG or WebP (max. 4MB)
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {errors.avatar && (
          <p className="text-sm text-destructive">{errors.avatar.message}</p>
        )}
      </div>

      <Separator />

      {/* ---------- BIO ---------- */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <p className="text-xs text-muted-foreground">
          Write a short introduction about yourself.
        </p>
        <Textarea
          id="bio"
          className={cn(
            "min-h-[120px] resize-none",
            errors.bio && "border-destructive focus-visible:ring-destructive"
          )}
          placeholder="I'm a Product Designer based in Melbourne, Australia. I specialize in UX/UI design..."
          {...register("bio")}
          maxLength={500}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
        <p className="text-xs text-muted-foreground text-right">
          {watch("bio")?.length || 0}/500
        </p>
      </div>

      <Separator />

      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!isDirty || isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="w-full sm:w-auto min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
