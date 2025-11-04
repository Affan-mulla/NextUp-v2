# Zustand Quickstart

Minimal steps to use the user store effectively.

## Install and Setup

Already configured in this repo:
- Store file: `lib/store/user-store.ts`
- Provider: `components/providers/session-provider.tsx`
- Query client: `components/providers/react-query-provider.tsx`

Wrap your app in both providers (already done in `app/layout.tsx`).

## Common Patterns

### Get the whole user
```tsx
import { useUser } from '@/lib/store/user-store'
const user = useUser()
```

### Subscribe to a field
```tsx
import { useUserField } from '@/lib/store/user-store'
const email = useUserField('email')
```

### Check auth state
```tsx
import { useIsAuthenticated } from '@/lib/store/user-store'
const isAuth = useIsAuthenticated()
```

### Hydration guard
```tsx
import { useIsHydrated } from '@/lib/store/user-store'
if (!useIsHydrated()) return null
```

### Update user
```tsx
import { useUserActions } from '@/lib/store/user-store'
const { updateUser } = useUserActions()
updateUser({ name: 'New Name' })
```

### Clear user
```tsx
const { clearUser } = useUserActions()
clearUser()
```

## After Auth Actions

- After sign-in/sign-out/profile update, invalidate session:
```tsx
import { useInvalidateSession } from '@/lib/hooks/useSession'
const invalidate = useInvalidateSession()
await invalidate()
```

## Tips

- Prefer field selectors for performance
- Do not store tokens
- Use middleware for protected routes; server validates sensitive actions

