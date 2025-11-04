"use client";

import { useUser, useUserField, useIsAuthenticated, useUserActions } from "@/lib/store/user-store";
import { AuthGuard, GuestGuard, RoleGuard } from "@/components/auth/auth-guards";

/**
 * Example 1: Display user profile
 */
export function UserProfile() {
  const user = useUser();

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.avatar && (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-full"
          />
        )}
        {user.role && <p><strong>Role:</strong> {user.role}</p>}
      </div>
    </div>
  );
}

/**
 * Example 2: Performance-optimized email display
 * Only re-renders when email changes (not when name or other fields change)
 */
export function EmailDisplay() {
  const email = useUserField("email");
  
  return (
    <span className="text-sm text-gray-600">
      {email || "No email"}
    </span>
  );
}

/**
 * Example 3: Conditional rendering based on auth status
 */
export function WelcomeBanner() {
  const isAuthenticated = useIsAuthenticated();
  const name = useUserField("name");

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
      {isAuthenticated ? (
        <h1 className="text-xl">Welcome back, {name}! 👋</h1>
      ) : (
        <h1 className="text-xl">Welcome, Guest! Please log in.</h1>
      )}
    </div>
  );
}

/**
 * Example 4: Update user profile (partial update)
 */
export function ProfileEditor() {
  const user = useUser();
  const { updateUser } = useUserActions();

  const handleUpdateName = () => {
    const newName = prompt("Enter new name:", user?.name);
    if (newName) {
      updateUser({ name: newName });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Edit Profile</h3>
      <button
        onClick={handleUpdateName}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Update Name
      </button>
    </div>
  );
}

/**
 * Example 5: Protected page (requires authentication)
 */
export function ProtectedPage() {
  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Protected Content</h1>
        <p>Only authenticated users can see this!</p>
        <UserProfile />
      </div>
    </AuthGuard>
  );
}

/**
 * Example 6: Login page (redirects if already logged in)
 */
export function LoginPage() {
  return (
    <GuestGuard redirectTo="/dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {/* Your login form here */}
      </div>
    </GuestGuard>
  );
}

/**
 * Example 7: Admin-only page (requires specific role)
 */
export function AdminPage() {
  return (
    <RoleGuard 
      allowedRoles={["admin"]} 
      redirectTo="/"
      fallback={
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You need admin privileges to view this page.</p>
        </div>
      }
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Only admins can see this!</p>
      </div>
    </RoleGuard>
  );
}

/**
 * Example 8: Avatar with fallback
 */
export function UserAvatar() {
  const avatar = useUserField("avatar");
  const name = useUserField("name");

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img 
          src={avatar} 
          alt={name || "User"} 
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-bold">
            {name?.substring(0, 2).toUpperCase() || "??"}
          </span>
        </div>
      )}
      <span className="font-medium">{name}</span>
    </div>
  );
}

/**
 * Example 9: Navigation menu that adapts to auth state
 */
export function NavigationMenu() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800">
      <a href="/" className="hover:underline">Home</a>
      
      {isAuthenticated ? (
        <>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/profile" className="hover:underline">Profile</a>
          <a href="/settings" className="hover:underline">Settings</a>
        </>
      ) : (
        <>
          <a href="/auth/sign-in" className="hover:underline">Login</a>
          <a href="/auth/sign-up" className="hover:underline">Sign Up</a>
        </>
      )}
    </nav>
  );
}

/**
 * Example 10: Loading state aware component
 */
export function UserGreeting() {
  const { useIsLoading, useIsHydrated } = require("@/lib/store/user-store");
  const isLoading = useIsLoading();
  const isHydrated = useIsHydrated();
  const name = useUserField("name");

  if (!isHydrated) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  return <div>Hello, {name || "Guest"}!</div>;
}
