# 🔍 Debugging: NavUser Showing Null User

## Issue Summary
NavUser component was showing `null` even when a user was logged in. This was because:
1. **Missing hydration check** - Component didn't wait for store to hydrate
2. **No loading state** - While session was being fetched, component returned `null`
3. **Early null return** - Component wasn't showing any UI during initialization

## ✅ What We Fixed

### Changes Made to `nav-user.tsx`:

1. **Added hydration imports**
   ```tsx
   import { useUser, useUserActions, useIsHydrated, useIsLoading } from "@/lib/store/user-store"
   import { Skeleton } from "@/components/ui/skeleton"
   ```

2. **Check store state before rendering**
   ```tsx
   const isHydrated = useIsHydrated()
   const isLoading = useIsLoading()
   ```

3. **Show loading skeleton during hydration**
   ```tsx
   if (!isHydrated || isLoading) {
     return (
       <SidebarMenu className="...">
         <SidebarMenuItem>
           <div className="flex items-center gap-2 px-2 py-1.5">
             <Skeleton className="h-8 w-8 rounded-lg" />
             <div className="flex-1 space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-3 w-32" />
             </div>
           </div>
         </SidebarMenuItem>
       </SidebarMenu>
     )
   }
   ```

4. **Removed console.log debug statement**

## 🔧 How the User Session Flow Works

```
User logs in
    ↓
Better Auth verifies credentials
    ↓
SessionProvider mounted
    ↓
useSessionQuery fetches /api/session
    ↓
Backend calls auth.api.getSession()
    ↓
mapSessionUser() converts Better Auth user → User interface
    ↓
hydrateFromSession() sets user in Zustand store
    ↓
isHydrated flag becomes true
    ↓
NavUser can now safely render user data
```

## 🐛 Possible Reasons for Continued Issues

If NavUser is STILL showing null after this fix, check:

### 1. Session Endpoint Not Returning User
**Test:** Open browser DevTools → Network → Check `/api/session` response

```bash
# In browser console:
fetch('/api/session', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "avatar": "...",
    "emailVerified": true,
    "createdAt": "..."
  }
}
```

If `user: null`, check:
- Is Better Auth session valid? (`auth.api.getSession()`)
- Are request headers correct? (cookies being sent?)
- Database has the user? Check `user` table in Prisma

### 2. Better Auth Configuration Issues
**Check:** `lib/auth/auth.ts`

```tsx
// Verify:
- Auth provider (Prisma adapter) is correctly configured
- Database URL is correct
- User table exists and has correct schema
- Sessions table exists
```

### 3. SessionProvider Not Wrapping Your Component
**Check:** `app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactQueryProvider>
          <SessionProvider>  {/* ✅ Must wrap children */}
            {children}
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
```

### 4. sessionStorage Disabled
**Test:** In browser console:

```javascript
// Check if sessionStorage works
sessionStorage.setItem('test', 'works');
console.log(sessionStorage.getItem('test'));

// If returns null or throws:
// - Browser is in private/incognito mode
// - Or sessionStorage is disabled
// - Or running in iframe with wrong cross-origin policy
```

**Solution:** Add localStorage fallback in user-store.ts:
```tsx
storage: createJSONStorage(() => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }
  // Fallback to localStorage if sessionStorage unavailable
  return window.localStorage || null;
})
```

### 5. Cookies Not Being Sent
**Check:** In `lib/hooks/useSession.ts`

```tsx
const query = useQueryAny({
  queryKey: SESSION_QUERY_KEY,
  queryFn: async () => {
    const res = await fetch('/api/session', { 
      credentials: 'include'  // ✅ CRITICAL: Send cookies
    })
    // ...
  },
})
```

### 6. CORS Issues (if API on different domain)
**Check:** Backend has correct CORS headers

```tsx
// If /api/session returns 401 or 403:
// - CORS might be blocking the request
// - Or cookies aren't being sent
// - Or session is expired
```

## 🧪 Debug Checklist

Run these checks in browser console:

```javascript
// 1. Check if Zustand store is available
window.__ZUSTAND__ // Should exist if imported anywhere

// 2. Check sessionStorage
console.log('sessionStorage:', sessionStorage.getItem('user-storage'));

// 3. Check React Query cache
// Open DevTools → React Query tab (if DevTools extension installed)

// 4. Check network request
fetch('/api/session', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('Session response:', data))

// 5. Check Better Auth session
// (If you have auth client exposed)
authClient.getSession()
  .then(session => console.log('Auth session:', session))
```

## 🚀 Testing After Fix

1. **Clear storage and reload:**
   ```bash
   1. Open DevTools → Application → Clear Storage
   2. Reload page
   3. Log in again
   4. Check if NavUser shows skeleton first, then user profile
   ```

2. **Check console logs (if debug mode enabled):**
   ```tsx
   <SessionProvider debug={true}>
     {children}
   </SessionProvider>
   ```
   Should see: `✅ Session hydrated: user@email.com`

3. **Test persistence:**
   ```
   1. Log in
   2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   3. User should still be logged in (from sessionStorage)
   ```

4. **Test logout:**
   ```
   1. Log in
   2. Click logout
   3. NavUser should show null
   4. Redirect to /auth/sign-in should work
   ```

## 📋 Common Error Messages

### "NavUser returned null"
→ User not in store yet. Check if session fetch is working.

### "Hydration mismatch"
→ Check `useIsHydrated()` guard is in place.

### "User is null in NavUser"
→ Session endpoint returned `user: null`. Check auth session.

### "sessionStorage is not defined"
→ Running on server. Ensure NavUser is client component (`"use client"`).

## 📚 Related Documentation

- See: `/docs/guides/SESSION_MANAGEMENT_GUIDE.md` for full session system
- See: `/lib/store/user-store.ts` for store implementation
- See: `/components/providers/session-provider.tsx` for provider logic
- See: `/components/auth/auth-guards.tsx` for hydration patterns

