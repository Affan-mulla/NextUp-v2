# Better Auth Integration - Ideas Feed System

## Overview

This project uses **Better Auth** (not Supabase Auth) for authentication. All authentication checks have been configured to work with Better Auth's session management.

## Authentication Flow

### Better Auth Session Structure

```typescript
// Better Auth session
interface Session {
  user: {
    id: string;
    email: string;
    username?: string;
    name: string;
    image?: string;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
  };
}
```

### How Authentication Works

#### 1. Server Components (RSC)
```typescript
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// In server component or server function
const headersList = await headers();
const session = await auth.api.getSession({ 
  headers: headersList as any 
});

if (session?.user?.id) {
  // User is authenticated
  const userId = session.user.id;
}
```

#### 2. API Routes
```typescript
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ 
    headers: request.headers as any 
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  // Proceed with authenticated logic
}
```

#### 3. Client Components
```typescript
"use client";

import { useSession } from "@/lib/auth/auth-client";

export function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  
  if (session?.user) {
    // User is authenticated
    const userId = session.user.id;
  }
}
```

## Updated Files for Better Auth

### 1. Vote API Route (`app/api/ideas/vote/route.ts`)

**Before (Supabase Auth):**
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**After (Better Auth):**
```typescript
const session = await auth.api.getSession({ headers: request.headers as any });
if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const userId = session.user.id;
```

### 2. Server Utils (`lib/supabase/ideas.ts`)

**Before (Supabase Auth):**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // Check vote status
}
```

**After (Better Auth):**
```typescript
const headersList = await headers();
const session = await auth.api.getSession({ headers: headersList as any });
const userId = session?.user?.id;

if (userId) {
  // Check vote status
}
```

### 3. Database Policies (SQL)

**Before (Supabase Auth with auth.uid()):**
```sql
CREATE POLICY "votes_insert_policy" 
ON "Votes" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = "userId");
```

**After (Better Auth - Application Layer):**
```sql
CREATE POLICY "votes_insert_policy" 
ON "Votes" 
FOR INSERT 
WITH CHECK (true); -- Auth handled at application layer

-- Note: With Better Auth and Prisma, we handle authorization
-- in the application code rather than database policies.
-- This provides more flexibility and better integration with
-- the Better Auth session system.
```

## Database Schema

Better Auth uses these tables (already in your schema):

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  username      String    @unique
  name          String
  image         String?
  
  sessions      Session[]
  accounts      Account[]
  // ... other relations
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("session")
}

model Account {
  id           String    @id
  accountId    String
  providerId   String
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken  String?
  // ... other OAuth fields
  
  @@map("account")
}
```

## Authorization Pattern

### Server-Side Authorization

```typescript
// lib/auth/server-auth.ts
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({ 
    headers: headersList as any 
  });
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

Usage:
```typescript
// In API route
import { requireAuth } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    // User is guaranteed to be authenticated here
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

### Client-Side Authorization

```typescript
// components/ProtectedComponent.tsx
"use client";

import { useSession } from "@/lib/auth/auth-client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export function ProtectedComponent() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      redirect("/auth/sign-in");
    }
  }, [session, isPending]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return <div>Protected content for {session.user.name}</div>;
}
```

## Voting Flow with Better Auth

### Complete Flow

```
1. User clicks upvote button
   ↓
2. IdeaCard calls onVote(ideaId, "UP")
   ↓
3. useVoteIdea mutation executes
   ↓
4. Optimistic update (immediate UI change)
   ↓
5. POST /api/ideas/vote with Better Auth session cookie
   ↓
6. API route validates session:
   - auth.api.getSession({ headers })
   - Check session?.user?.id exists
   ↓
7. Database operation:
   - Check existing vote
   - Toggle/update/insert vote
   - Update votesCount
   ↓
8. Return success
   ↓
9. React Query confirms optimistic update
   (or rolls back on error)
```

## Security Considerations

### 1. Session Cookie

Better Auth sets a cookie: `better-auth.session_token`

**Production Settings:**
```typescript
// lib/auth/auth.ts
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
  },
  // ... other config
});
```

### 2. API Route Protection

Always validate session in API routes:

```typescript
const session = await auth.api.getSession({ headers: request.headers as any });
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 3. User ID Validation

When creating/updating resources:

```typescript
// Ensure the authenticated user owns the resource
const idea = await prisma.ideas.findUnique({
  where: { id: ideaId }
});

if (idea.userId !== session.user.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Differences from Supabase Auth

| Feature | Supabase Auth | Better Auth |
|---------|---------------|-------------|
| Auth Check | `supabase.auth.getUser()` | `auth.api.getSession({ headers })` |
| User ID | `user.id` | `session.user.id` |
| Session Storage | Supabase manages | Your database (Prisma) |
| RLS Support | Native with auth.uid() | Application-layer auth |
| Social Providers | Built-in | Configure manually |
| Email/Password | Built-in | Configure manually |

## Migration Notes

If you're migrating from Supabase Auth to Better Auth:

1. ✅ **Updated API Routes** - All routes now use `auth.api.getSession()`
2. ✅ **Updated Server Utils** - `getIdeas()` uses Better Auth
3. ✅ **Updated SQL Script** - RLS policies work with application-layer auth
4. ⚠️ **Session Migration** - Users will need to re-authenticate
5. ⚠️ **User ID Format** - Ensure user IDs match between systems

## Testing Authentication

### Test Authenticated Requests

```typescript
// In your test file
const response = await fetch('/api/ideas/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'better-auth.session_token=YOUR_TOKEN'
  },
  body: JSON.stringify({ ideaId: '123', type: 'UP' })
});
```

### Test Unauthenticated Requests

```typescript
const response = await fetch('/api/ideas/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ ideaId: '123', type: 'UP' })
});

expect(response.status).toBe(401);
```

## Debugging Authentication Issues

### 1. Check Session Cookie

```typescript
// In API route
console.log('Cookies:', request.cookies.getAll());
console.log('Session:', await auth.api.getSession({ headers: request.headers as any }));
```

### 2. Verify Session in Database

```sql
SELECT * FROM "session" 
WHERE "token" = 'YOUR_TOKEN' 
AND "expiresAt" > NOW();
```

### 3. Check User Table

```sql
SELECT * FROM "user" WHERE "id" = 'USER_ID';
```

## Common Issues

### Issue: "Unauthorized" on API calls

**Solution:**
- Check that Better Auth session cookie is being sent
- Verify session hasn't expired
- Check that `auth.api.getSession()` is called correctly

### Issue: Session not persisted

**Solution:**
- Ensure session cookie is httpOnly and secure in production
- Check session expiry settings in Better Auth config
- Verify database session table has correct data

### Issue: User ID mismatch

**Solution:**
- Better Auth uses `session.user.id`, not `user.id`
- Ensure all code references `session.user.id` consistently

## Best Practices

1. **Always validate sessions** in API routes
2. **Use server-side session checks** for sensitive operations
3. **Don't trust client-side auth state** alone
4. **Implement proper CSRF protection** (Better Auth handles this)
5. **Set appropriate session expiry times**
6. **Use HTTPS in production** for secure cookies
7. **Implement rate limiting** on auth endpoints

---

**Status**: ✅ Better Auth Integration Complete
**Last Updated**: November 7, 2025
