"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export function UnverifiedEmailBanner({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage("");

    try {
      await axios.post("/api/auth/resend-verification", { email });
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to send email. Please try again.";
      setMessage(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription>
          Please verify your email address to access all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We sent a verification email to <strong>{email}</strong>. Click the link in the email to verify your account.
        </p>
        {message && (
          <p className={`text-sm ${message.includes("sent") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          variant="outline"
          size="sm"
        >
          {isResending ? "Sending..." : "Resend Verification Email"}
        </Button>
      </CardContent>
    </Card>
  );
}
