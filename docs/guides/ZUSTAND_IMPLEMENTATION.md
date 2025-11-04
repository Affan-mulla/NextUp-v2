# Zustand Implementation Details

This document explains the shape of the store, persistence strategy, and how to integrate it with React Query and Better Auth.

## Store Basics

- File: `lib/store/user-store.ts`
- State persisted with `persist` middleware to `sessionStorage`
- Key: `user-store`
- Guards SSR with `isHydrated` flag

### State Shape (example)

```ts
interface User {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  role?: string | null
}

interface UserState {
  user: User | null
  isHydrated: boolean
}

interface UserActions {
  setUser: (user: User | null) => void
  clearUser: () => void
  updateUser: (patch: Partial<User>) => void
}
```

## Selectors

- `useUser()` — subscribe to entire user object
- `useUserField<K extends keyof User>(key: K)` — subscribe to a single field
- `useIsAuthenticated()` — derived boolean
- `useIsHydrated()` — SSR hydration guard
- `useUserActions()` — stable action references

## Persistence

- Storage: `sessionStorage` (tab-scoped)
- Rationale: Clears automatically when tab closes; safer than localStorage
- Only non-sensitive data (no tokens!)

## Integration with React Query

- `SessionProvider` calls `useSessionQuery()`
- On success, it hydrates Zustand via `setUser()`
- React Query caches the value to avoid fetching on each navigation
- Invalidate with `useInvalidateSession()` after auth changes

## Mapping Session Data

- Server validates via `app/api/session/route.ts`
- Map Better Auth session to the `User` shape used by the store
- Avoid storing tokens or sensitive metadata; keep it minimal (id, email, name, image)

## Example Usage Patterns

```tsx
// Selective render by field
const avatar = useUserField('image')

// Check logged-in status
const isAuth = useIsAuthenticated()

// Update display name
const { updateUser } = useUserActions()
updateUser({ name: 'Alice' })
```

## Performance Notes

- Prefer field selectors for components rendering single values
- Avoid subscribing to the whole `user` unless needed
- Hydration is guarded to prevent SSR mismatch

## Testing Checklist

- Store hydrates from sessionStorage on client
- `isHydrated` flips to true after mount
- `setUser`, `updateUser`, `clearUser` behave as expected
- Field selectors trigger minimal re-renders

