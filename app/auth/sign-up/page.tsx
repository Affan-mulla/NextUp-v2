import { ArrowBigUpDash, GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "@/components/forms/signup-form"

export default async function SignupPage() {
      'use cache';
  return (
 
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  )
}
