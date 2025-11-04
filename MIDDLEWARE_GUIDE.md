# Next.js Middleware Guide (proxy.ts)

## 📁 File Location

Place this file at: **`e:\nextup\proxy.ts`** (root of your Next.js project)

This is a Next.js middleware file that runs on **every request** before your pages load.

---

## 🎯 What It Does

Protects private routes from unauthenticated users using **lightweight cookie checks only** — no database queries, no Prisma calls, instant redirects.

### Key Features

✅ **Instant routing** - Cookie checks take <1ms vs ~1s for DB queries  
✅ **Easy to maintain** - Add/remove protected routes in a single array  
✅ **Production-ready** - Optimized for performance and security  
✅ **Better Auth compatible** - Works with Better Auth session cookies  
✅ **Redirect tracking** - Preserves original URL for post-login redirect  

---

## 🔧 How to Configure

### 1. Add or Remove Protected Routes

Edit the `protectedRoutes` array in `proxy.ts`:

```typescript
const protectedRoutes = [
  "/settings",      // Protects /settings and /settings/*
  "/dashboard",     // Protects /dashboard and /dashboard/*
  "/idea",          // Protects /idea and /idea/*
  "/u",             // Protects /u and /u/*
  "/launch",        // Protects /launch
  "/leaderboard",   // Protects /leaderboard
]
```

**Examples:**

```typescript
// To add a new protected route:
const protectedRoutes = [
  "/settings",
  "/dashboard",
  "/admin",        // ← Add this line
]

// To remove protection from a route:
const protectedRoutes = [
  "/settings",
  // "/dashboard",  // ← Comment out or delete
  "/idea",
]
```

### 2. Set Your Auth Cookie Name

Better Auth typically uses `"better-auth.session_token"` by default, but you should verify:

```typescript
const AUTH_COOKIE_NAME = "better-auth.session_token"
```

**How to find your cookie name:**

1. Sign in to your app
2. Open browser DevTools (F12)
3. Go to **Application** tab → **Cookies**
4. Look for a cookie starting with `better-auth`
5. Copy the exact name and update `AUTH_COOKIE_NAME`

**Common cookie names:**
- `better-auth.session_token` (default)
- `better-auth.session`
- `authjs.session-token` (if using Auth.js)
- `sb-access-token` (Supabase)

---

## 🚀 How It Works

### Request Flow

```
User navigates to /settings
         ↓
Middleware checks: is /settings protected?
         ↓ YES
Check for cookie "better-auth.session_token"
         ↓
    Cookie exists?
    /           \
  YES            NO
   ↓              ↓
Allow      Redirect to
request    /auth/sign-in?redirectedFrom=/settings
```

### Code Flow

```typescript
1. User visits /settings
2. Middleware checks protectedRoutes array → finds "/settings"
3. Looks for request.cookies.get("better-auth.session_token")
4. If cookie missing → redirect to /auth/sign-in?redirectedFrom=/settings
5. If cookie exists → allow request (returns NextResponse)
```

---

## 🔐 Security Notes

### What This Middleware Does

- ✅ Provides **instant UX** by redirecting unauthenticated users immediately
- ✅ Prevents **unnecessary page loads** for protected routes
- ✅ Avoids **expensive DB queries** on every navigation

### What This Middleware Does NOT Do

- ❌ **Not a security boundary** - cookies can be forged
- ❌ **Does not validate tokens** - only checks cookie existence
- ❌ **Does not verify permissions** - role checks happen server-side

### Where Real Security Happens

You **must still validate sessions** in:

1. **API Routes** (`/app/api/*/route.ts`):
   ```typescript
   import { auth } from "@/lib/auth/auth"
   
   export async function GET(request: Request) {
     const session = await auth.api.getSession({ 
       headers: request.headers 
     })
     
     if (!session?.user) {
       return new Response("Unauthorized", { status: 401 })
     }
     
     // ... protected logic
   }
   ```

2. **Server Components** (`/app/**/page.tsx`):
   ```typescript
   import { auth } from "@/lib/auth/auth"
   import { redirect } from "next/navigation"
   
   export default async function SettingsPage() {
     const session = await auth.api.getSession({
       headers: await headers()
     })
     
     if (!session?.user) {
       redirect("/auth/sign-in")
     }
     
     return <SettingsUI user={session.user} />
   }
   ```

3. **Server Actions**:
   ```typescript
   "use server"
   
   import { auth } from "@/lib/auth/auth"
   
   export async function updateProfile(formData: FormData) {
     const session = await auth.api.getSession({
       headers: await headers()
     })
     
     if (!session?.user) {
       throw new Error("Unauthorized")
     }
     
     // ... update logic
   }
   ```

---

## 🧪 Testing Your Middleware

### Manual Test

1. **Sign out** from your app
2. Navigate to a protected route (e.g., `/settings`)
3. You should be **instantly redirected** to `/auth/sign-in?redirectedFrom=/settings`
4. Sign in → you should be redirected back to `/settings`

### Check Cookie Name

Open your browser console and run:

```javascript
// After signing in, run this in console:
document.cookie.split(';').forEach(c => console.log(c.trim()))

// Look for the Better Auth cookie name
```

### Verify No DB Calls

1. Open your app logs/terminal
2. Navigate between protected routes (e.g., `/settings` → `/dashboard` → `/idea`)
3. Confirm you see **no Prisma queries** in the logs
4. Navigation should feel **instant** (no ~1s delays)

---

## 📝 Common Patterns

### Pattern 1: Public Route Within Protected Parent

Sometimes you want `/dashboard` protected but `/dashboard/public` open:

```typescript
export async function proxy(request: NextRequest) {
  const refreshed = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Allow public sub-routes
  if (pathname === "/dashboard/public") {
    return refreshed
  }

  // Then check protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // ... rest of logic
}
```

### Pattern 2: Role-Based Route Protection

For role-based checks, you'll need server-side validation:

```typescript
// In your page.tsx or API route:
const session = await auth.api.getSession({ headers: await headers() })

if (!session?.user) {
  redirect("/auth/sign-in")
}

if (session.user.role !== "admin") {
  redirect("/unauthorized")
}
```

### Pattern 3: Post-Login Redirect

Your sign-in page should handle the `redirectedFrom` param:

```typescript
// app/auth/sign-in/page.tsx
export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string }
}) {
  const redirectTo = searchParams.redirectedFrom || "/dashboard"
  
  // After successful login:
  router.push(redirectTo)
}
```

---

## 🐛 Troubleshooting

### Issue: Still seeing DB queries on navigation

**Solution:** Check that:
1. You're using the cookie name check, not `auth.api.getSession()`
2. Your middleware is in the root directory as `proxy.ts`
3. You've restarted your dev server after changes

### Issue: Redirects to sign-in even when signed in

**Solution:** Check that:
1. `AUTH_COOKIE_NAME` matches your actual cookie name
2. Cookie is being set correctly by Better Auth
3. Cookie isn't being blocked by browser settings or extensions

### Issue: Can access protected routes when signed out

**Solution:** Check that:
1. Route is listed in `protectedRoutes` array
2. Route path matches exactly (case-sensitive)
3. Middleware is running (add `console.log` to verify)

---

## 📚 Additional Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Route Protection Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)

---

## ✨ Quick Reference

### Add a new protected route
```typescript
const protectedRoutes = [
  "/settings",
  "/your-new-route",  // ← Add here
]
```

### Remove route protection
```typescript
const protectedRoutes = [
  // "/old-route",  // ← Comment out
]
```

### Change auth cookie name
```typescript
const AUTH_COOKIE_NAME = "your-cookie-name"  // ← Update here
```

### Disable middleware temporarily
```typescript
export async function proxy(request: NextRequest) {
  return NextResponse.next()  // ← Bypass all logic
}
```

---

**Need help?** Check the troubleshooting section above or review your Better Auth configuration.
