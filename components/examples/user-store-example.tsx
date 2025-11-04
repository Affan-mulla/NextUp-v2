"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  useUser,
  useIsAuthenticated,
  useUserField,
  useUserActions,
  User,
} from "@/lib/store/user-store";
import { useState } from "react";

/**
 * Example 1: Basic Usage - Reading and Updating Store
 * 
 * This component demonstrates:
 * - Using selectors to prevent unnecessary re-renders
 * - Reading user data efficiently
 * - Updating user state
 */
export function UserStoreBasicExample() {
  // ✅ GOOD: Use selector to get only what you need
  // This component only re-renders when `user` changes
  const user = useUser();
  
  // ✅ GOOD: Get actions separately (never causes re-renders)
  const { setUser, updateUser, clearUser } = useUserActions();

  const handleLogin = () => {
    // Simulate login - set complete user data
    setUser({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      avatar: "/avatars/john.jpg",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    clearUser();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Store Usage</CardTitle>
        <CardDescription>Reading and updating user state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm">
              <strong>Role:</strong> {user.role || "N/A"}
            </p>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Not logged in</p>
            <Button onClick={handleLogin} size="sm">
              Simulate Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Optimized Field Access
 * 
 * This component demonstrates:
 * - Using useUserField for maximum performance
 * - Only re-renders when the specific field changes
 * - Other user updates don't trigger re-renders
 */
export function UserFieldExample() {
  // ✅ BEST: Only subscribes to the 'name' field
  // Won't re-render if email, avatar, or other fields change
  const userName = useUserField("name");
  const userEmail = useUserField("email");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimized Field Access</CardTitle>
        <CardDescription>
          Uses useUserField - only re-renders when specific field changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {userName || "Not set"}
          </p>
          <p>
            <strong>Email:</strong> {userEmail || "Not set"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ℹ️ This component won't re-render if you change the user's avatar or role
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Profile Editor
 * 
 * This component demonstrates:
 * - Partial updates using updateUser
 * - Form handling with Zustand
 * - Optimistic UI updates
 */
export function ProfileEditorExample() {
  const user = useUser();
  const { updateUser } = useUserActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleUpdate = () => {
    if (!name && !email) return;

    // Partial update - only updates provided fields
    updateUser({
      ...(name && { name }),
      ...(email && { email }),
    });

    // Clear form
    setName("");
    setEmail("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Editor</CardTitle>
        <CardDescription>Update user data with partial updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div className="space-y-2">
              <Field>
                <FieldLabel>Update Name</FieldLabel>
                <Input
                  placeholder={user.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Update Email</FieldLabel>
                <Input
                  type="email"
                  placeholder={user.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
            <Button onClick={handleUpdate} size="sm" disabled={!name && !email}>
              Update Profile
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Please login first</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Authentication Guard
 * 
 * This component demonstrates:
 * - Using useIsAuthenticated for auth checks
 * - Efficient re-renders (only when auth status changes)
 * - Conditional rendering based on auth
 */
export function AuthGuardExample() {
  // ✅ GOOD: Only subscribes to authentication status
  const isAuthenticated = useIsAuthenticated();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>Efficient auth state checking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isAuthenticated ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            ℹ️ This only re-renders when authentication status changes, not when user
            data changes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Example Component - Combines all examples
 */
export function UserStoreExamples() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Zustand User Store Examples</h1>
        <p className="text-muted-foreground">
          Production-ready patterns for global user state management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserStoreBasicExample />
        <UserFieldExample />
        <ProfileEditorExample />
        <AuthGuardExample />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>
              <strong>Use selectors:</strong> useUser(), useIsAuthenticated(),
              useUserField() prevent unnecessary re-renders
            </li>
            <li>
              <strong>Separate actions:</strong> useUserActions() never causes
              re-renders
            </li>
            <li>
              <strong>Field-specific access:</strong> useUserField("email") is most
              performant
            </li>
            <li>
              <strong>Persist middleware:</strong> User data survives page reloads via
              localStorage
            </li>
            <li>
              <strong>TypeScript safety:</strong> All operations are fully typed
            </li>
            <li>
              <strong>Partial updates:</strong> updateUser() only changes specified
              fields
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * ============================================================================
 * Usage in Your Components
 * ============================================================================
 * 
 * // 1. After successful login:
 * const { setUser } = useUserActions();
 * await authClient.signIn.email(..., {
 *   onSuccess: (data) => {
 *     setUser({
 *       id: data.user.id,
 *       name: data.user.name,
 *       email: data.user.email,
 *       avatar: data.user.avatar,
 *     });
 *   }
 * });
 * 
 * // 2. On logout:
 * const { clearUser } = useUserActions();
 * await authClient.signOut();
 * clearUser();
 * router.push('/auth/sign-in');
 * 
 * // 3. Display user name in navbar:
 * const userName = useUserField("name"); // Most efficient
 * return <span>{userName}</span>;
 * 
 * // 4. Check auth in middleware/guards:
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) router.push('/auth/sign-in');
 * 
 * // 5. Update profile:
 * const { updateUser } = useUserActions();
 * updateUser({ name: "New Name", avatar: "/new-avatar.jpg" });
 * 
 * ============================================================================
 */
