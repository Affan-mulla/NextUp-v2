"use client";

import { UserStoreExamples } from "@/components/examples/user-store-example";
import { AuthGuard } from "@/components/auth/auth-guards";

export default function ExamplesPage() {
  return (
    <AuthGuard>
      <UserStoreExamples />
    </AuthGuard>
  );
}
