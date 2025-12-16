import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

/**
 * SettingsSkeleton Component
 * 
 * Displays loading skeletons for Settings tabs.
 * Matches the grid layout of Account, General, Billing, and Privacy tabs.
 */
export function AccountSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grid layout matching AccountClient */}
      <div className="grid grid-cols-1 gap-3 auto-rows-[minmax(140px,auto)] md:grid-cols-2 lg:grid-cols-3 grid-flow-dense">
        {/* Email Card - col-span-2 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-64" />
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>

        {/* Connected Accounts - row-span-2 */}
        <Card className="col-span-1 md:row-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <AccountProviderSkeleton />
            <AccountProviderSkeleton />
          </CardContent>
        </Card>

        {/* Sessions Card - col-span-2, row-span-2 */}
        <Card className="col-span-1 md:col-span-2 md:row-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <SessionRowSkeleton />
            <Skeleton className="h-px w-full" />
            <SessionRowSkeleton />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Danger Zone - col-span-3 */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GeneralSkeleton() {
  return (
    <div className="space-y-10">
      {/* Section header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Name & Username fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Email field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-3 w-64" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Avatar upload */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-56" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-28 w-full max-w-sm rounded-xl" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Bio field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Grid layout matching Billing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)] grid-flow-dense">
        {/* Current Plan - col-span-2 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-end gap-2">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="flex items-end gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            <UsageRowSkeleton />
            <UsageRowSkeleton />
            <UsageRowSkeleton />
          </CardContent>
        </Card>

        {/* Payment Method - col-span-2 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-10 w-44" />
          </CardContent>
        </Card>

        {/* Invoices - col-span-3 */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PrivacySkeleton() {
  return (
    <div className="max-w-6xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Grid layout matching Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)]">
        {/* Profile Visibility - col-span-2 */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRowSkeleton />
            <ToggleRowSkeleton />
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent>
            <ToggleRowSkeleton />
          </CardContent>
        </Card>

        {/* Additional cards */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRowSkeleton />
            <ToggleRowSkeleton />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sub-component skeletons
function AccountProviderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <Skeleton className="size-6 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

function SessionRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-9 w-20" />
    </div>
  );
}

function UsageRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

function ToggleRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}

/**
 * Default skeleton for settings tabs
 * Uses AccountSkeleton as it's the most complex
 */
export default function SettingsSkeleton() {
  return <AccountSkeleton />;
}
