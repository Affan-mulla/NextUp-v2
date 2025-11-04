# Quick Start Guide: User Store Integration

## ⚡ 5-Minute Integration

### Step 1: Import and Use in Components

```typescript
import { useUser, useUserActions } from "@/lib/store/user-store";
```

### Step 2: Read User Data

```typescript
function MyComponent() {
  const user = useUser(); // Get entire user
  // OR
  const name = useUserField("name"); // Get specific field (more performant)
  
  return <div>{user?.name}</div>;
}
```

### Step 3: Set User on Login

Already integrated in:
- `components/forms/login-form.tsx`
- `components/forms/signup-form.tsx`

```typescript
const { setUser } = useUserActions();

// After successful auth:
const session = await authClient.getSession();
setUser({
  id: session.user.id,
  name: session.user.name,
  email: session.user.email,
  avatar: session.user.image,
});
```

### Step 4: Clear User on Logout

Already integrated in:
- `components/Sidebar/nav-user.tsx`

```typescript
const { clearUser } = useUserActions();

// On logout:
await authClient.signOut();
clearUser();
router.push("/auth/sign-in");
```

## 🎯 Common Use Cases

### Display User Avatar

```typescript
function UserAvatar() {
  const avatar = useUserField("avatar");
  return <img src={avatar || "/default.jpg"} />;
}
```

### Show Welcome Message

```typescript
function WelcomeMessage() {
  const name = useUserField("name");
  return <h1>Welcome, {name}!</h1>;
}
```

### Auth Guard for Pages

```typescript
function ProtectedPage() {
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }
  
  return <div>Protected content</div>;
}
```

### Update Profile

```typescript
function ProfileEditor() {
  const { updateUser } = useUserActions();
  
  const handleSave = (newData) => {
    updateUser(newData); // Partial update
    toast.success("Profile updated!");
  };
}
```

## 📊 Performance Tips

### ❌ Avoid This (causes unnecessary re-renders)

```typescript
function BadExample() {
  const store = useUserStore(); // Re-renders on ANY change
  return <div>{store.user?.name}</div>;
}
```

### ✅ Do This Instead

```typescript
function GoodExample() {
  const name = useUserField("name"); // Only re-renders when name changes
  return <div>{name}</div>;
}
```

## 🔍 Debugging

### View Current Store State

```typescript
// In browser console:
window.__ZUSTAND__ = require("zustand");
```

Or add this debug component:

```typescript
function StoreDebugger() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  
  return (
    <pre>
      {JSON.stringify({ user, isAuthenticated }, null, 2)}
    </pre>
  );
}
```

## 🚨 Troubleshooting

### User not persisting after refresh?

Check localStorage:
```javascript
localStorage.getItem('user-storage')
```

### User not updating in UI?

Make sure you're using selectors:
```typescript
// ✅ Good
const user = useUser();

// ❌ Bad
const store = useUserStore();
```

### Auth state out of sync?

Always call `clearUser()` on logout and `setUser()` on login.

## 📝 Next Steps

1. ✅ Store is ready to use
2. ✅ Already integrated in auth flows
3. ✅ Already integrated in sidebar
4. 🎯 Replace any remaining props drilling with store hooks
5. 🎯 Add loading states if needed
6. 🎯 Extend User type for your needs

## 📚 Full Documentation

See `lib/store/README.md` for complete API reference and best practices.

## 💡 Examples

See `components/examples/user-store-example.tsx` for:
- Basic usage patterns
- Performance optimization techniques
- Profile editing
- Auth guards
- And more!

To view examples in your app, create a route:

```typescript
// app/examples/page.tsx
import { UserStoreExamples } from "@/components/examples/user-store-example";

export default function Page() {
  return <UserStoreExamples />;
}
```

Then visit: `http://localhost:3000/examples`
