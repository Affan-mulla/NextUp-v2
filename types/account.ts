/**
 * Account Settings Type Definitions
 * Central location for all account-related types
 */

export interface OAuthProviderInfo {
  id: string;
  providerId: string; // e.g., "github", "google"
  createdAt: string;
  updatedAt: string;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  current: boolean;
}

export interface AccountSettingsData {
  email: string;
  emailVerified: boolean;
  hasCredentials: boolean;
  hasOAuth: boolean;
  oauthProviders: OAuthProviderInfo[];
  lastPasswordUpdatedAt: string | null;
  sessions: SessionInfo[];
}

/**
 * Derived auth state flags for UI logic
 */
export interface AuthStateFlags {
  hasCredentials: boolean;
  hasOAuth: boolean;
  canDisconnectProvider: (providerId: string, connectedOAuthCount: number) => boolean;
}
