"use client";

import { Suspense } from "react";
import { CreateIdeaForm } from "@/components/forms/CreateIdeaForm";
import { AuthGuard } from "@/components/auth/auth-guards";
import { useRouter } from "next/navigation";

/**
 * Create Idea Page
 * Uses the production-ready CreateIdeaForm component
 */
export default function CreateIdeaPage() {

  const router = useRouter();
  const handleSuccess = (ideaId: string) => {
    // Optionally redirect or show a success message
    router.push(`/idea/${ideaId}`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
            <CreateIdeaForm onSuccess={handleSuccess} />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  );
}
