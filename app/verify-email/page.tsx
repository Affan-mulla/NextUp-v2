"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, Loader2, Mail } from "lucide-react";

type VerificationState = "loading" | "success" | "invalid" | "expired" | "already-verified" | "error" | "check-email";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>("loading");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const message = searchParams.get("message");

  useEffect(() => {
    if (message === "check-email" && email) {
      setState("check-email");
      return;
    }

    const verifyEmail = async () => {
      if (!token || !email) {
        setState("invalid");
        return;
      }

      try {
        const response = await axios.get(
          `/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
        );
        const data = response.data;

        if (data.alreadyVerified) {
          setState("already-verified");
        } else {
          setState("success");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        const errorData = error.response?.data;
        
        if (errorData?.expired) {
          setState("expired");
        } else if (errorData?.invalid) {
          setState("invalid");
        } else {
          setState("error");
        }
      }
    };

    verifyEmail();
  }, [token, email]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setResendMessage("");

    try {
      await axios.post("/api/auth/resend-verification", { email });
      setResendMessage("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to send email. Please try again.";
      setResendMessage(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case "loading":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Verifying Email
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case "success":
        return (
          <Card className="w-full max-w-md ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Email Verified!
              </CardTitle>
              <CardDescription>
                Your email has been successfully verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can now access all features of NextUp.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        );

      case "already-verified":
        return (
          <Card className="w-full max-w-md ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
                Already Verified
              </CardTitle>
              <CardDescription>
                This email address has already been verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can proceed to use NextUp.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        );

      case "expired":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="h-6 w-6" />
                Link Expired
              </CardTitle>
              <CardDescription>
                This verification link has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Verification links are valid for 1 hour. Request a new verification email to continue.
              </p>
              {resendMessage && (
                <p className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                  {resendMessage}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "invalid":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Invalid Link
              </CardTitle>
              <CardDescription>
                This verification link is invalid or has been used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The link may have been tampered with or already used. Request a new verification email.
              </p>
              {resendMessage && (
                <p className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                  {resendMessage}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "error":
        return (
          <Card className="w-full max-w-md ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Verification Failed
              </CardTitle>
              <CardDescription>
                An error occurred while verifying your email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please try again later or contact support if the problem persists.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        );

      case "check-email":
        return (
          <Card className="w-full max-w-md ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Mail className="h-6 w-6" />
                Check Your Email
              </CardTitle>
              <CardDescription>
                We've sent you a verification email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A verification link has been sent to <strong>{email}</strong>. 
                Please check your inbox and click the link to verify your account.
              </p>
              <p className="text-sm text-muted-foreground">
                The link will expire in 1 hour.
              </p>
              {resendMessage && (
                <p className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                  {resendMessage}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="w-full"
              >
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      {renderContent()}
    </div>
  );
}
