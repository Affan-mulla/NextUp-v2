# Global User State Management with Zustand

A production-ready, TypeScript-first implementation of global user state management using Zustand.

## 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
- [Performance Optimization](#performance-optimization)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## ✨ Features

- ✅ **TypeScript Support**: Full type safety for state and actions
- ✅ **Persistent Storage**: User data survives page reloads (localStorage)
- ✅ **Performance Optimized**: Minimal re-renders via selectors
- ✅ **Zero Boilerplate**: Clean, simple API
- ✅ **Modular Design**: Easy to extend and maintain
- ✅ **SSR Compatible**: Works with Next.js App Router

## 🏗️ Architecture

```
lib/store/
├── user-store.ts          # Main store implementation
└── README.md              # This file

Integration Points:
├── components/forms/login-form.tsx    # Sets user on login
├── components/forms/signup-form.tsx   # Sets user on signup
├── components/Sidebar/nav-user.tsx    # Reads user, clears on logout
└── components/examples/                # Usage examples
```

### Store Structure

```typescript
{
  // State
  user: User | null,           // Current user object
  isAuthenticated: boolean,    // Auth status flag

  // Actions
  setUser: (user) => void,     // Set complete user data
  updateUser: (partial) => void, // Partial update
  clearUser: () => void,       // Clear on logout
  checkAuth: () => boolean     // Check auth status
}
```

## 📖 Usage Guide

### 1. After Successful Login/Signup

```typescript
import { useUserActions } from "@/lib/store/user-store";

function LoginForm() {
  const { setUser } = useUserActions();

  const onSuccess = async () => {
    const session = await authClient.getSession();
    
    setUser({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.image,
    });
  };
}
```

### 2. Display User Data

```typescript
import { useUser, useUserField } from "@/lib/store/user-store";

// Option 1: Get entire user object
function UserProfile() {
  const user = useUser(); // Re-renders when user changes
  return <div>{user?.name}</div>;
}

// Option 2: Get specific field (BEST for performance)
function UserName() {
  const name = useUserField("name"); // Only re-renders when name changes
  return <span>{name}</span>;
}
```

### 3. Update User Profile

```typescript
import { useUserActions } from "@/lib/store/user-store";

function EditProfile() {
  const { updateUser } = useUserActions();

  const handleSave = () => {
    // Partial update - only changes specified fields
    updateUser({
      name: "New Name",
      avatar: "/new-avatar.jpg"
    });
  };
}
```

### 4. On Logout

```typescript
import { useUserActions } from "@/lib/store/user-store";

function LogoutButton() {
  const { clearUser } = useUserActions();

  const handleLogout = async () => {
    await authClient.signOut();
    clearUser(); // Clears store and localStorage
    router.push("/auth/sign-in");
  };
}
```

### 5. Protected Routes / Auth Guards

```typescript
import { useIsAuthenticated } from "@/lib/store/user-store";

function ProtectedPage() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return <div>Protected Content</div>;
}
```

## ⚡ Performance Optimization

### Problem: Unnecessary Re-renders

```typescript
// ❌ BAD: Entire component re-renders on ANY user change
function UserDisplay() {
  const store = useUserStore();
  return <div>{store.user?.name}</div>;
}
```

### Solution: Use Selectors

```typescript
// ✅ GOOD: Only re-renders when user changes
function UserDisplay() {
  const user = useUser();
  return <div>{user?.name}</div>;
}

// ✅ BEST: Only re-renders when name changes
function UserName() {
  const name = useUserField("name");
  return <div>{name}</div>;
}

// ✅ PERFECT: Never re-renders (actions are stable)
function UserActions() {
  const { updateUser } = useUserActions();
  return <button onClick={() => updateUser({...})}>Update</button>;
}
```

### Re-render Comparison

| Approach | Re-renders on name change | Re-renders on email change |
|----------|---------------------------|----------------------------|
| `useUserStore()` | ✅ Yes | ✅ Yes |
| `useUser()` | ✅ Yes | ✅ Yes |
| `useUserField("name")` | ✅ Yes | ❌ No |
| `useUserField("email")` | ❌ No | ✅ Yes |
| `useUserActions()` | ❌ No | ❌ No |

## 📚 API Reference

### State

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}
```

### Actions

#### `setUser(user: User)`
Set complete user data. Use after login/signup.

```typescript
const { setUser } = useUserActions();
setUser({
  id: "123",
  name: "John",
  email: "john@example.com"
});
```

#### `updateUser(updates: Partial<User>)`
Partially update user data. Preserves existing fields.

```typescript
const { updateUser } = useUserActions();
updateUser({ name: "New Name" }); // Only updates name
```

#### `clearUser()`
Clear user data and mark as unauthenticated. Use on logout.

```typescript
const { clearUser } = useUserActions();
clearUser();
```

#### `checkAuth()`
Returns boolean indicating if user is authenticated.

```typescript
const { checkAuth } = useUserActions();
if (checkAuth()) {
  // User is logged in
}
```

### Selectors

#### `useUser()`
Returns entire user object. Re-renders when user changes.

```typescript
const user = useUser();
```

#### `useIsAuthenticated()`
Returns authentication status. Only re-renders when auth status changes.

```typescript
const isAuthenticated = useIsAuthenticated();
```

#### `useUserField(field)`
Returns specific user field. Most performant option.

```typescript
const name = useUserField("name");
const email = useUserField("email");
const avatar = useUserField("avatar");
```

#### `useUserActions()`
Returns all actions. Never causes re-renders.

```typescript
const { setUser, updateUser, clearUser } = useUserActions();
```

## 💡 Best Practices

### 1. Always Use Selectors

```typescript
// ❌ Avoid
const store = useUserStore();

// ✅ Prefer
const user = useUser();
const actions = useUserActions();
```

### 2. Extract Actions Outside Components

```typescript
// ✅ Good: Actions don't cause re-renders
const { updateUser } = useUserActions();

// Pass stable reference to child components
<ChildComponent onUpdate={updateUser} />
```

### 3. Use Field Selectors for Large Components

```typescript
// If you only need the name:
const name = useUserField("name"); // Better than useUser()
```

### 4. Sync with Auth State

Always update the store after auth operations:

```typescript
// Login
onSuccess: async () => {
  const session = await authClient.getSession();
  setUser(session.user);
}

// Logout
clearUser();
router.push("/auth/sign-in");
```

### 5. Handle SSR Properly

The store uses localStorage which is client-side only. The persist middleware handles this automatically.

```typescript
// No special handling needed - just use the hooks
const user = useUser(); // Works in server and client components
```

## 🔒 Persistence

User data is automatically saved to localStorage with the key `user-storage`.

### Change Storage Location

```typescript
// In user-store.ts, modify:
{
  name: 'user-storage',
  storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
}
```

### Disable Persistence

Remove the `persist` middleware:

```typescript
export const useUserStore = create<UserStore>()((set, get) => ({
  // ... state and actions
}));
```

## 🧪 Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserStore, useUserActions } from './user-store';

test('setUser updates store', () => {
  const { result } = renderHook(() => useUserActions());
  
  act(() => {
    result.current.setUser({
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  const store = useUserStore.getState();
  expect(store.user?.name).toBe('Test User');
  expect(store.isAuthenticated).toBe(true);
});
```

## 📦 Bundle Size

- Zustand: ~1.2KB gzipped
- Store implementation: ~0.5KB gzipped
- Total overhead: **~1.7KB gzipped**

## 🔄 Migration from Props/Context

### Before (Props drilling)

```typescript
function App() {
  const [user, setUser] = useState(null);
  return <Sidebar user={user} />;
}
```

### After (Zustand)

```typescript
function App() {
  return <Sidebar />; // Sidebar reads from store
}

function Sidebar() {
  const user = useUser(); // Direct access
}
```

## 🤝 Contributing

When extending the store:

1. Add types to `User` interface
2. Add actions if needed
3. Create selectors for new fields
4. Update this README

## 📄 License

MIT
