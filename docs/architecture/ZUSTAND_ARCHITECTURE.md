# Zustand User Store Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interactions                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
    ┌──────────────┬──────────────────┬──────────────────┐
    │              │                  │                  │
    │   Login      │    Signup        │    Logout        │
    │   Form       │    Form          │    Button        │
    │              │                  │                  │
    └──────┬───────┴──────┬───────────┴─────┬────────────┘
          │              │                 │
          ▼              ▼                 ▼
    ┌─────────────────────────────────────────────────┐
    │         Zustand User Store (Global)             │
    │  ┌───────────────────────────────────────────┐  │
    │  │  State:                                   │  │
    │  │  • user: User | null                      │  │
    │  │  • isAuthenticated: boolean               │  │
    │  └───────────────────────────────────────────┘  │
    │                                                 │
    │  ┌───────────────────────────────────────────┐  │
    │  │  Actions:                                 │  │
    │  │  • setUser(user)                          │  │
    │  │  • updateUser(partial)                    │  │
    │  │  • clearUser()                            │  │
    │  │  • checkAuth()                            │  │
    │  └───────────────────────────────────────────┘  │
    │                                                 │
    │  ┌───────────────────────────────────────────┐  │
    │  │  Persist Middleware (localStorage)        │  │
    │  │  Key: 'user-storage'                      │  │
    │  └───────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────┘
                           │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Sidebar    │  │  Navbar     │  │  Profile    │
    │  (NavUser)  │  │             │  │  Page       │
    │             │  │             │  │             │
    │  useUser()  │  │ useUserField│  │ useUserField│
    │             │  │   ("name")  │  │  ("avatar") │
    └─────────────┘  └─────────────┘  └─────────────┘
```

## 🔄 Data Flow

### Login Flow
```
User enters credentials
       │
       ▼
authClient.signIn.email()
       │
       ▼
onSuccess callback
       │
       ▼
authClient.getSession()
       │
       ▼
setUser({ id, name, email, avatar })
       │
       ▼
Store updated
       │
       ▼
localStorage saved
       │
       ▼
All components using selectors re-render
```

### Component Read Flow
```
Component calls useUserField("name")
       │
       ▼
Zustand subscribes to user.name only
       │
       ▼
Component renders with current value
       │
       ▼
When user.name changes:
       │
       ▼
Component re-renders
       │
       ▼
When user.email changes:
       │
       ▼
Component DOES NOT re-render (optimization!)
```

### Logout Flow
```
User clicks logout
       │
       ▼
authClient.signOut()
       │
       ▼
clearUser()
       │
       ▼
Store cleared: user = null, isAuthenticated = false
       │
       ▼
localStorage cleared
       │
       ▼
router.push('/auth/sign-in')
       │
       ▼
All components re-render with null user
```

## 📊 Performance Model

### Re-render Triggers

```typescript
// Example store state:
{
  user: {
    id: "123",
    name: "John",
    email: "john@example.com",
    avatar: "/avatar.jpg"
  },
  isAuthenticated: true
}

// When user.name changes to "Jane":

Component A (useUserStore()):     ✅ Re-renders
Component B (useUser()):           ✅ Re-renders
Component C (useUserField("name")): ✅ Re-renders
Component D (useUserField("email")): ❌ No re-render (optimized!)
Component E (useUserActions()):    ❌ No re-render (actions stable)
Component F (useIsAuthenticated()): ❌ No re-render (auth unchanged)
```

## 🎯 Selector Strategy

Choose the right selector for maximum performance:

```
┌─────────────────────────────────────────────────────┐
│  Need entire user object?                           │
│  → useUser()                                        │
│    Re-renders: When user changes                    │
│    Use case: Profile page, user cards               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Need one field (name, email, etc)?                 │
│  → useUserField("fieldName")                        │
│    Re-renders: Only when that field changes         │
│    Use case: Headers, avatars, labels (BEST)        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Need auth status only?                             │
│  → useIsAuthenticated()                             │
│    Re-renders: Only when auth status changes        │
│    Use case: Auth guards, conditional rendering     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Need to update state?                              │
│  → useUserActions()                                 │
│    Re-renders: Never                                │
│    Use case: Forms, buttons, callbacks              │
└─────────────────────────────────────────────────────┘
```

## 💾 Persistence Layer

```
┌──────────────────────────────────────────────────┐
│              Browser localStorage                │
│                                                  │
│  Key: 'user-storage'                             │
│  Value: {                                        │
│    state: {                                      │
│      user: { id, name, email, avatar },          │ 
│      isAuthenticated: true                       │
│    },                                            │
│    version: 0                                    │
│  }                                               │
└──────────────────────────────────────────────────┘
       ▲                         │
       │                         ▼
    On change               On page load
       │                         │
       └─────────────────────────┘
            Zustand Store
```

## 🔐 Security Considerations

```
┌────────────────────────────────────────────┐
│  What's Stored in localStorage:            │
│  • User ID (safe, public identifier)       │
│  • Name (safe, user-facing data)           │
│  • Email (safe, user-facing data)          │
│  • Avatar URL (safe, public URL)           │
│                                             │
│  What's NOT Stored:                         │
│  • Passwords ❌                             │
│  • Auth tokens ❌ (handled by authClient)  │
│  • Sensitive PII ❌                         │
└────────────────────────────────────────────┘
```

## 🎨 Component Integration Patterns

### Pattern 1: Display User Info
```typescript
function UserName() {
  const name = useUserField("name");
  return <span>{name}</span>;
}
```

### Pattern 2: Update User Data
```typescript
function EditProfile() {
  const { updateUser } = useUserActions();
  return (
    <button onClick={() => updateUser({ name: "New" })}>
      Update
    </button>
  );
}
```

### Pattern 3: Conditional Rendering
```typescript
function ProfileMenu() {
  const user = useUser();
  if (!user) return <LoginButton />;
  return <UserMenu user={user} />;
}
```

### Pattern 4: Auth Guard
```typescript
function ProtectedRoute() {
  const isAuth = useIsAuthenticated();
  if (!isAuth) redirect("/login");
  return <Page />;
}
```

## 📈 Scaling Strategy

As your app grows:

1. **Add fields to User type**
   ```typescript
   interface User {
     // ... existing
     role: 'admin' | 'user';
     preferences: UserPreferences;
   }
   ```

2. **Add new actions**
   ```typescript
   updatePreferences: (prefs) => void;
   ```

3. **Create specialized selectors**
   ```typescript
   export const useUserRole = () => 
     useUserStore((state) => state.user?.role);
   ```

4. **Split into multiple stores if needed**
   - user-store.ts (auth & profile)
   - settings-store.ts (preferences)
   - app-store.ts (UI state)

## 🎓 Learning Resources

- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Performance Patterns](https://docs.pmnd.rs/zustand/guides/performance)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)

## 🚀 Quick Commands

```
# View examples
npm run dev
# Navigate to http://localhost:3000/examples

# Check store in console
> localStorage.getItem('user-storage')

# Clear store manually
> localStorage.removeItem('user-storage')
> window.location.reload()
```

---

**Questions?** Check:
1. `lib/store/README.md` - Full API reference
2. `ZUSTAND_QUICKSTART.md` - 5-minute guide
3. `components/examples/user-store-example.tsx` - Live examples
