"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge01Icon,
  Delete02Icon,
  GithubIcon,
  GoogleIcon,
  Link04Icon,
  Logout01Icon,
  Unlink04Icon,
} from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { parseUserAgent, formatIpLocation } from "@/lib/utils/user-agent";
import { Loader2 } from "lucide-react";
import { Session } from "better-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { Spinner } from "../ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPasswordSchema, PasswordFormValues } from "@/lib/validation/password-validation";

export interface OAuthProviderInfo {
  id: string;
  providerId: string; // e.g., "github", "google"
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithCurrent extends Session {
  current: boolean;
}

export interface AccountSettingsProps {
  email: string;
  emailVerified: boolean;
  hasCredentials: boolean;
  hasOAuth: boolean;
  oauthProviders: OAuthProviderInfo[];
  lastPasswordUpdatedAt: string | null;
  sessions: SessionWithCurrent[];
}

export default function AccountClient(props: AccountSettingsProps) {
  const {
    email,
    emailVerified,
    hasCredentials,
    oauthProviders,
    hasOAuth,
    lastPasswordUpdatedAt,
    sessions,
  } = props;

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const canDisconnect = (providerId: string) => {
    const connectedOauthCount = oauthProviders.length;
    return hasCredentials || connectedOauthCount > 1;
  };

  const handleConnect = async (provider: string) => {
    setLoadingAction(`connect-${provider}`);
    try {
      // This will start OAuth flow; Better Auth should link if already signed-in
      await authClient.linkSocial({
        provider: provider,
        callbackURL: "/settings/account",
      });
    } catch (e) {
      console.error("Connect error", e);
      toast.error(`Failed to connect ${provider}. Please try again.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!canDisconnect(providerId)) {
      toast.error("Cannot disconnect your only sign-in method");
      return;
    }

    setLoadingAction(`disconnect-${providerId}`);

    try {
      const { data, error } = await authClient.unlinkAccount({
        providerId: providerId,
      });

      if (error) {
        console.error("Disconnect error", error);
        toast.error(
          error.message || "Something went wrong while unlinking your account."
        );
        return;
      }

      if (data?.status) {
        toast.success(`${providerId} disconnected successfully`);

      }
    } catch (e) {
      console.error("Disconnect error", e);
      toast.error("Failed to disconnect provider. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogoutOther = async (sessionId: string) => {
    setLoadingAction(`logout-${sessionId}`);
    try {
      const { data, error } = await authClient.revokeSession({
        token: sessionId,
      });

      if (error) {
        console.error("Revoke session error", error);
        toast.error(error.message || "Failed to revoke session");
        return;
      }

      if (data?.status) {
        toast.success("Session revoked successfully");

      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to revoke session. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogoutAll = async () => {
    if (
      !confirm(
        "Are you sure you want to log out of all devices? You'll need to sign in again."
      )
    ) {
      return;
    }

    setLoadingAction("logout-all");
    try {
      const { data, error } = await authClient.revokeSessions();

      if (error) {
        console.error("Revoke sessions error", error);
        toast.error(error.message || "Failed to log out of all devices");
        setLoadingAction(null);
        return;
      }

      if (data?.status) {
        toast.success("Logged out of all devices");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to log out of all devices. Please try again.");
      setLoadingAction(null);
    }
  };

  const knownProviders = [
    { key: "github", label: "GitHub" },
    // { key: "google", label: "Google" },
  ];

  const connectedSet = new Set(oauthProviders.map((p) => p.providerId));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your login methods, sessions, and account security.
        </p>
      </div>

      <div
        className="
            grid
            grid-cols-1
            gap-3
            auto-rows-[minmax(140px,auto)]
            md:grid-cols-2
            lg:grid-cols-3
            grid-flow-dense
        "
      >
        <Card className="col-span-1 md:col-span-2">
          <EmailCard
            email={email}
            emailVerified={emailVerified}
            hasCredentials={hasCredentials}
          />
        </Card>

        <Card className="col-span-1">
          <PasswordCard
            hasCredentials={hasCredentials}
            lastUpdatedAt={lastPasswordUpdatedAt}
          />
        </Card>

        <Card className="col-span-1 md:row-span-2">
          <ConnectedAccountsCard
            providers={knownProviders.map((p) => ({
              name: p.label,
              providerId: p.key,
              connected: connectedSet.has(p.key),
              disableDisconnect: !canDisconnect(p.key),
            }))}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            loadingAction={loadingAction}
          />
        </Card>

        <Card className="col-span-1 md:col-span-2 md:row-span-2">
          <SessionsCard
            sessions={sessions}
            onLogoutOther={handleLogoutOther}
            onLogoutAll={handleLogoutAll}
            loadingAction={loadingAction}
          />
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <DangerZoneCard />
        </Card>
      </div>
    </div>
  );
}

function EmailCard({
  email,
  emailVerified,
  hasCredentials,
}: {
  email: string;
  emailVerified: boolean;
  hasCredentials: boolean;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>Email address</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between flex-wrap sm:gap-0 gap-4">
        <div>
          <p className="font-medium">{email}</p>
          {emailVerified && (
            <Badge className="mt-2 h-6 gap-1">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-4" />
              Verified
            </Badge>
          )}
          {!emailVerified && (
            <p className="text-sm text-muted-foreground mt-1">
              Verify your email to secure your account.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {hasCredentials
              ? "This email is your login identifier."
              : "This email is used for notifications and billing."}
          </p>
        </div>
        <Button variant="outline">Change email</Button>
      </CardContent>
    </>
  );
}
function PasswordChange({ hasCredentials }: { hasCredentials: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(createPasswordSchema(hasCredentials)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    try {
      const { data: res, error } = await authClient.changePassword({
        currentPassword: data.currentPassword || "",
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        console.error("Change password error", error);

        // Map Better Auth errors to user-friendly messages
        const errorMessage = error.message || "";
        
        if (errorMessage.toLowerCase().includes("current password") || 
            errorMessage.toLowerCase().includes("incorrect") ||
            errorMessage.toLowerCase().includes("invalid")) {
          setError("currentPassword", {
            message: "Current password is incorrect",
          });
        } else if (errorMessage.toLowerCase().includes("weak") ||
                   errorMessage.toLowerCase().includes("common")) {
          setError("newPassword", {
            message: "Password is too weak. Try a stronger password.",
          });
        } else {
          toast.error(errorMessage || "Failed to update password. Please try again.");
        }
        return;
      }

      if (res?.token) {
        toast.success(
          hasCredentials
            ? "Password changed successfully"
            : "Password set successfully"
        );
        reset();
        setOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {hasCredentials ? "Change password" : "Set password"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasCredentials ? "Change password" : "Set a password"}
          </DialogTitle>
          <DialogDescription>
            {hasCredentials
              ? "Enter your current password to set a new one."
              : "Create a password to enable email sign-in."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {hasCredentials && (
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || isSubmitting}
            >
              {loading ? (
                <>
                  <Spinner />
                  {hasCredentials ? "Updating..." : "Setting..."}
                </>
              ) : hasCredentials ? (
                "Update password"
              ) : (
                "Set password"
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground">
          {hasCredentials
            ? "Other sessions will be logged out for security."
            : "You can still sign in with your connected accounts."}
        </p>
      </DialogContent>
    </Dialog>
  );
}


function PasswordCard({
  hasCredentials,
  lastUpdatedAt,
}: {
  hasCredentials: boolean;
  lastUpdatedAt: string | null;
}) {
  const lastUpdatedText = lastUpdatedAt
    ? `Last updated ${formatDistanceToNow(new Date(lastUpdatedAt))} ago`
    : null;

  return (
    <>
      <CardHeader>
        <CardTitle>Password & authentication</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {hasCredentials ? "Password" : "No password set"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasCredentials
              ? lastUpdatedText
              : "Set a password to enable email login."}
          </p>
        </div>
        <PasswordChange hasCredentials={hasCredentials} />
      </CardContent>
    </>
  );
}

function ConnectedAccountsCard({
  providers,
  onConnect,
  onDisconnect,
  loadingAction,
}: {
  providers: {
    name: string;
    providerId: string;
    connected: boolean;
    disableDisconnect: boolean;
  }[];
  onConnect: (providerId: string) => void;
  onDisconnect: (providerId: string) => void;
  loadingAction: string | null;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((p) => (
          <ConnectedProvider
            key={p.providerId}
            name={p.name}
            providerId={p.providerId}
            connected={p.connected}
            actionLabel={p.connected ? "Disconnect" : "Connect"}
            disabled={p.connected && p.disableDisconnect}
            isLoading={
              loadingAction === `connect-${p.providerId}` ||
              loadingAction === `disconnect-${p.providerId}`
            }
            onAction={() =>
              p.connected ? onDisconnect(p.providerId) : onConnect(p.providerId)
            }
          />
        ))}
      </CardContent>
    </>
  );
}



function SessionsCard({
  sessions,
  onLogoutOther,
  onLogoutAll,
  loadingAction,
}: {
  sessions: SessionWithCurrent[];
  onLogoutOther: (sessionId: string) => void;
  onLogoutAll: () => void;
  loadingAction: string | null;
}) {
  const current = sessions.find((s) => s.current);
  const others = sessions.filter((s) => !s.current);

  return (
    <>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {current && (
          <SessionRow
            device={parseUserAgent(current.userAgent)}
            location={formatIpLocation(current.ipAddress)}
            current
          />
        )}
        {others.length > 0 && (
          <>
            <Separator />
            {others.map((s) => (
              <SessionRow
                key={s.id}
                device={parseUserAgent(s.userAgent)}
                location={formatIpLocation(s.ipAddress)}
                isLoading={loadingAction === `logout-${s.id}`}
                onLogout={() => onLogoutOther(s.id)}
              />
            ))}
          </>
        )}

        <Separator />
        <Button
          variant="outline"
          className="text-destructive w-full"
          onClick={onLogoutAll}
          disabled={loadingAction === "logout-all"}
        >
          {loadingAction === "logout-all" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={Logout01Icon} />
          )}
          Log out of all devices
        </Button>
      </CardContent>
    </>
  );
}

function DangerZoneCard() {
  return (
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
}


function ConnectedProvider({
  name,
  providerId,
  connected,
  actionLabel,
  disabled,
  isLoading,
  onAction,
}: {
  name: string;
  providerId: string;
  connected: boolean;
  actionLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
  onAction: () => void;
}) {

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "github":
        return GithubIcon;
      case "google":
        return GoogleIcon;
      default:
        return GithubIcon;
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <HugeiconsIcon icon={getProviderIcon(providerId)} className="size-6" />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>
      <Button
        variant={connected ? "outline" : "default"}
        className="w-full max-w-32"
        disabled={disabled || isLoading}
        onClick={onAction}
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <HugeiconsIcon
            icon={connected ? Unlink04Icon : Link04Icon}
            className="size-5"
          />
        )}
        {actionLabel}
      </Button>
    </div>
  );
}



function SessionRow({
  device,
  location,
  current,
  isLoading,
  onLogout,
}: {
  device: string;
  location: string;
  current?: boolean;
  isLoading?: boolean;
  onLogout?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{device}</p>
        <p className="text-sm text-muted-foreground">
          {location} {current && "• Current session"}
        </p>
      </div>
      {!current && onLogout && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={Logout01Icon} />
          )}
          Log out
        </Button>
      )}
    </div>
  );
}
