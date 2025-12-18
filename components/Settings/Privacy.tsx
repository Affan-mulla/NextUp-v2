"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <div className="max-w-6xl space-y-6 px-4 py-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Privacy</h2>
        <p className="text-sm text-muted-foreground">
          Control how your profile, activity, and data are used.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)] [grid-auto-flow:dense]">
        {/* PROFILE VISIBILITY */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Profile visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Public profile"
              description="Allow others to view your profile"
            />
            <ToggleRow
              label="Show activity"
              description="Display posts and comments on your profile"
            />
          </CardContent>
        </Card>

        {/* DATA USAGE */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Data usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Analytics"
              description="Help improve Nextup using anonymous data"
            />
          </CardContent>
        </Card>

        {/* DISCOVERABILITY */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Discoverability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Search visibility"
              description="Appear in user and product search"
            />
            <ToggleRow
              label="Leaderboards"
              description="Show your activity in rankings"
            />
          </CardContent>
        </Card>

        {/* COMMUNICATION */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Communication preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              label="Product updates"
              description="Receive updates about features and launches"
            />
            <ToggleRow
              label="Marketing emails"
              description="Occasional tips, promotions, and announcements"
            />
          </CardContent>
        </Card>

        {/* DATA CONTROL */}
        <Card className="col-span-3 border-destructive/40">
          <CardHeader>
            <CardTitle>Data control</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Download your data</p>
                <p className="text-sm text-muted-foreground">
                  Export your profile, posts, and feedback
                </p>
              </div>
              <Button variant="outline">Request export</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">
                  Request data deletion
                </p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your personal data
                </p>
              </div>
              <Button variant="destructive">Request deletion</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ToggleRow = ({
  label,
  description,
}: {
  label: string;
  description: string;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Switch />
  </div>
);

export default Privacy;
