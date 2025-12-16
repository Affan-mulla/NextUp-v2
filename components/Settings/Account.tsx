import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import AccountClient, { type AccountSettingsProps } from "./AccountClient";

export default async function Account() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs as any });

  if (!session?.user?.id) {
    // In protected routes we shouldn't land here, but guard anyway
    return null;
  }

  const allSessions = await auth.api.listSessions({
    headers: hdrs as any,
  });

  const accounts = await auth.api.listUserAccounts({
    headers: hdrs as any,
  });

  const hasCredentials = accounts.some((a) => a.providerId === "credential");
  const credentialsAccount = accounts.find((a) => a.providerId === "credential");
  const oauthProviders = accounts
    .filter((a) => a.providerId !== "credential")
    .map((a) => ({
      id: a.id,
      providerId: a.providerId,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

  // Map sessions and mark the current one
  const sessionsWithCurrentFlag = allSessions.map((s) => ({
    ...s,
    current: s.token === session.session.token,
  }));

  const data: AccountSettingsProps = {
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    hasCredentials,
    hasOAuth: oauthProviders.length > 0,
    oauthProviders,
    lastPasswordUpdatedAt: credentialsAccount ? credentialsAccount.updatedAt.toISOString() : null,
    sessions: sessionsWithCurrentFlag,
  };

  return <AccountClient {...data} />;
}