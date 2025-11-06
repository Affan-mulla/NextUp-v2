"use client";

import { Suspense } from "react";
import { CreateIdeaForm } from "@/components/forms/CreateIdeaForm";

/**
 * Create Idea Page
 * Uses the production-ready CreateIdeaForm component
 */
export default function CreateIdeaPage() {
  const handleSuccess = (ideaId: string) => {
    // You can add custom logic here when an idea is created successfully
    console.log("Idea created with ID:", ideaId);
    // Optionally redirect or show a success message
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <CreateIdeaForm onSuccess={handleSuccess} />
        </Suspense>
      </div>
    </div>
  );
}
