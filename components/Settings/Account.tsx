"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  Delete01Icon,
  Delete02Icon,
  Link04Icon,
  Logout01Icon,
  Unlink01Icon,
  Unlink04Icon,
} from "@hugeicons/core-free-icons";

const Account = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your login methods, sessions, and account security.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-3 auto-rows-[minmax(140px,auto)] [grid-auto-flow:dense]">
        {/* Primary identity */}
        <Card className="col-span-2 row-span-1">
          <EmailCard />
        </Card>
        {/* Auth */}
        <Card className="col-span-1 row-span-1">
          <PasswordCard />
        </Card>

        {/* Connected accounts */}
        <Card className="col-span-1 row-span-2">
          <ConnectedAccountsCard />
        </Card>

        {/* Sessions */}
        
        <Card className="col-span-2 row-span-2">
          <SessionsCard />
        </Card>

        {/* Danger zone */}
        <Card className="col-span-3 row-span-1">
          <DangerZoneCard />
        </Card>
      </div>
    </div>
  );
};

export default Account;

const EmailCard = () => (
  <>
    <CardHeader>
      <CardTitle>Email address</CardTitle>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="font-medium">anon@gmail.com</p>
        <Badge className="mt-2 h-6 gap-1">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-4" />
          Verified
        </Badge>
      </div>
      <Button variant="outline">Change email</Button>
    </CardContent>
  </>
);

const PasswordCard = () => (
  <>
    <CardHeader>
      <CardTitle>Password & authentication</CardTitle>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="font-medium">Password</p>
        <p className="text-sm text-muted-foreground">
          Last updated 2 months ago
        </p>
      </div>
      <Button variant="outline">Change password</Button>
    </CardContent>
  </>
);

const ConnectedAccountsCard = () => (
  <>
    <CardHeader>
      <CardTitle>Connected accounts</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <ConnectedProvider name="GitHub" connected actionLabel="Disconnect" />
      <ConnectedProvider
        name="Google"
        connected={false}
        actionLabel="Connect"
      />
    </CardContent>
  </>
);

const SessionsCard = () => (
  <>
    <CardHeader>
      <CardTitle>Active sessions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <SessionRow device="Chrome on Windows" location="India" current />
      <Separator />

      <Button variant="outline" className="text-destructive w-full">
        <HugeiconsIcon icon={Logout01Icon} />
        Log out of all devices
      </Button>
    </CardContent>
  </>
);

const DangerZoneCard = () => (
  <>
    <CardHeader>
      <CardTitle className="text-destructive">Danger zone</CardTitle>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="font-medium text-destructive">Delete account</p>
        <p className="text-sm text-muted-foreground">
          This action is irreversible.
        </p>
      </div>
      <Button variant="destructive">
        <HugeiconsIcon icon={Delete02Icon} />
        Delete account
      </Button>
    </CardContent>
  </>
);

const ConnectedProvider = ({
  name,
  connected,
  actionLabel,
}: {
  name: string;
  connected: boolean;
  actionLabel: string;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">
        {connected ? "Connected" : "Not connected"}
      </p>
    </div>
    <Button
      variant={connected ? "outline" : "default"}
      className="w-full max-w-32"
    >
      <HugeiconsIcon
        icon={connected ? Unlink04Icon : Link04Icon}
        className="size-5"
      />
      {actionLabel}
    </Button>
  </div>
);

const SessionRow = ({
  device,
  location,
  current,
}: {
  device: string;
  location: string;
  current?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">{device}</p>
      <p className="text-sm text-muted-foreground">
        {location} {current && "• Current session"}
      </p>
    </div>
    {!current && (
      <Button variant="outline" size="sm">
        <HugeiconsIcon icon={Logout01Icon} />
        Log out
      </Button>
    )}
  </div>
);
