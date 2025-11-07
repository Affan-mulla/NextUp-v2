/**
 * Error component for Ideas feed
 * Displays user-friendly error messages with retry functionality
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="p-2">
      <Card className="bg-background border-destructive/50 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Something went wrong</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {error?.message || "Failed to load ideas. Please try again."}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-fit">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="p-2">
      <Card className="bg-background border-border shadow-md rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-4xl">💡</div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share your brilliant idea!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
