/**
 * @deprecated This file is deprecated. Use GeneralSettingsForm.tsx instead.
 * This file is kept for backward compatibility.
 * 
 * New location: components/Settings/GeneralSettingsForm.tsx
 * New page route: app/(user)/settings/general/page.tsx
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-store";
import { Separator } from "../ui/separator";

export default function General() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const user = useUser();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };


  return (
    <div className="space-y-10 ">
      {/* ---------- SECTION TITLE ---------- */}
      <div>
        <h2 className="text-xl font-semibold">Personal info</h2>
        <p className="text-sm text-muted-foreground">
          Update your photo and personal details here.
        </p>
      </div>

      {/* ---------- NAME FIELDS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input placeholder="Olivia" defaultValue={user?.name} />
        </div>

        <div className="space-y-2">
          <Label>Username *</Label>
          <Input placeholder="Rhye" defaultValue={user?.username} />
        </div>
      </div>

      <Separator className=""  />

      {/* ---------- EMAIL ---------- */}
      <div className="space-y-2">
        <Label>Email address *</Label>
        <Input
          placeholder="olivia@example.com"
          defaultValue={user?.email}
          readOnly
          disabled={true}
        />
      </div>
      <Separator />
      {/* ---------- AVATAR UPLOAD ---------- */}
      <div className="space-y-2">
        <Label>Your photo *</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          This will be displayed on your profile.
        </p>

        <div className="flex items-center gap-6">
          {/* Avatar preview */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback>
              {user?.name?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Upload box */}
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full max-w-sm h-28 rounded-xl border border-border/60",
              "cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
            )}
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-sm font-medium text-foreground">
              Click to upload
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              SVG, PNG, JPG or GIF (max. 800 U+00d7; 400px)
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
      <Separator />
      {/* ---------- BIO ---------- */}
      <div className="space-y-2">
        <Label>Bio *</Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Write a short introduction.
        </p>
        <Textarea
          className="min-h-[120px]"
          placeholder="I'm a Product Designer based in Melbourne..."
        />
      </div>

      <Separator />
      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button variant="default">Save</Button>
      </div>
    </div>
  );
}
