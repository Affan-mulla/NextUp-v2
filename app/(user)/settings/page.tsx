"use client";

import { AuthGuard } from "@/components/auth/auth-guards";

const page = () => {
  return (
    <AuthGuard>
      <div>
          Settings Page
      </div>
    </AuthGuard>
  )
}
export default page