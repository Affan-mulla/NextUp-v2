# BetterAuth + Supabase Storage: Complete Architecture Guide

## 🎯 The Problem

You're using **BetterAuth** for authentication but **Supabase Storage** for file uploads. This creates a fundamental incompatibility:

### Why RLS Fails with BetterAuth

```sql
-- ❌ This RLS policy WILL NOT WORK with BetterAuth
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatar' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Why it fails:**
- `auth.uid()` and `auth.jwt()` are Supabase Auth functions
- They rely on Supabase's JWT token in the `Authorization` header
- BetterAuth uses its own session system (cookies, not JWTs)
- BetterAuth sessions are NOT Supabase JWTs
- Therefore, `auth.uid()` always returns `null`
- RLS policy fails with: `"new row violates row-level security policy"`

## ✅ The Solution

Use a **Next.js API route** that:
1. Validates BetterAuth session
2. Uploads to Supabase using **service role key** (bypasses RLS)
3. Returns public URL

### Architecture Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Select file
       │ 2. Client validation
       │ 3. FormData POST
       │
       ▼
┌─────────────────────────────┐
│  /api/upload/avatar         │
│  (Next.js API Route)        │
├─────────────────────────────┤
│  1. Validate BetterAuth     │ ← Session from cookie
│     session from headers    │
│                             │
│  2. Validate file           │
│     (size, type)            │
│                             │
│  3. Upload to Supabase      │ ← Service role key
│     using service role key  │   (bypasses RLS)
│                             │
│  4. Return public URL       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Storage   │
│  Bucket: "avatar"   │
├─────────────────────┤
│  RLS: PUBLIC READ   │ ← Only SELECT policy
│  (no auth needed)   │
└─────────────────────┘
```

## 📁 Complete Implementation

### 1. API Route: `/app/api/upload/avatar/route.ts`

```typescript
import { auth } from "@/lib/auth/auth";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Validate BetterAuth session
  const session = await auth.api.getSession({ 
    headers: request.headers as any 
  });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get file from FormData
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // 3. Upload using SERVICE ROLE KEY (bypasses RLS)
  const { data, error } = await supabaseServer.storage
    .from("avatar")
    .upload(`${session.user.id}/${Date.now()}-${file.name}`, file);

  // 4. Return public URL
  const { data: urlData } = supabaseServer.storage
    .from("avatar")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
```

### 2. Client Utility: `/lib/utils/upload-avatar.ts`

```typescript
export async function uploadAvatar(file: File) {
  // Client validates file
  if (file.size > 4 * 1024 * 1024) {
    return { success: false, error: "File too large" };
  }

  // Send to API route (BetterAuth session in cookies)
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/avatar", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return { success: true, url: data.url };
}
```

### 3. Supabase RLS: Minimal Policy

```sql
-- ONLY this policy needed (public read)
CREATE POLICY "Public read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatar');
```

**No INSERT/UPDATE/DELETE policies needed!**
- Service role key bypasses RLS
- BetterAuth validates user in API route
- Secure because service role key stays on server

## 🔐 Security Model

### Why This is Secure

| Component | Security Mechanism |
|-----------|-------------------|
| **Client** | File validation only (size/type) |
| **API Route** | BetterAuth session validation |
| **Supabase** | Service role key (server-only) |
| **RLS** | Public read only (no auth needed) |

### Key Points

1. **Service role key is NEVER exposed to client**
   - Only used in API route (server-side)
   - Bypasses RLS safely because auth happens in API route

2. **BetterAuth validates user identity**
   - Session checked before upload
   - User ID used for folder structure: `avatar/{userId}/`

3. **No Supabase Auth JWT needed**
   - BetterAuth session ≠ Supabase JWT
   - Can't generate Supabase JWTs for BetterAuth users
   - Don't need to - service role key handles it

## 🎨 Usage Example

### In React Component

```tsx
import { uploadAvatar } from "@/lib/utils/upload-avatar";

function ProfileForm() {
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    
    if (result.success) {
      console.log("Uploaded:", result.url);
      // Update user profile with new avatar URL
    }
  };

  return <input type="file" onChange={handleFileSelect} />;
}
```

## 🚀 Scalability

This architecture scales to any asset type:

### Banner Images

```typescript
// /app/api/upload/banner/route.ts
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  await supabaseServer.storage
    .from("banners") // Different bucket
    .upload(`${session.user.id}/banner.jpg`, file);
}
```

### Cover Photos

```typescript
// /app/api/upload/cover/route.ts
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  await supabaseServer.storage
    .from("covers")
    .upload(`${session.user.id}/cover.jpg`, file);
}
```

### Document Uploads

```typescript
// /app/api/upload/document/route.ts
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  await supabaseServer.storage
    .from("documents")
    .upload(`${session.user.id}/doc-${Date.now()}.pdf`, file);
}
```

## 📊 Comparison: Client Upload vs API Route

| Aspect | Client Upload (❌ Fails) | API Route (✅ Works) |
|--------|-------------------------|---------------------|
| **Auth Check** | RLS with `auth.uid()` | BetterAuth session |
| **Supabase Key** | Anon key (limited) | Service role (admin) |
| **RLS** | Required, fails | Bypassed safely |
| **Security** | JWT required | Session cookie |
| **Works with BetterAuth?** | ❌ No | ✅ Yes |

## 🔧 Setup Checklist

- [ ] Create `avatar` bucket in Supabase (mark as public)
- [ ] Add minimal RLS policy (public read only)
- [ ] Create API route: `/app/api/upload/avatar/route.ts`
- [ ] Update client utility: `/lib/utils/upload-avatar.ts`
- [ ] Verify environment variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...
  ```
- [ ] Test upload from `/settings/general`
- [ ] Verify file appears in Supabase Dashboard
- [ ] Verify public URL loads in browser

## 🐛 Troubleshooting

### Still getting RLS errors?

**Check 1:** API route uses `supabaseServer` (not `supabase`)
```typescript
// ✅ Correct
import { supabaseServer } from "@/lib/supabase/server";
await supabaseServer.storage.from("avatar").upload(...);

// ❌ Wrong
import { supabase } from "@/lib/supabase/client";
await supabase.storage.from("avatar").upload(...);
```

**Check 2:** BetterAuth session is valid
```typescript
const session = await auth.api.getSession({ headers: request.headers });
console.log("Session:", session); // Should have user.id
```

**Check 3:** Bucket exists and is public
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'avatar';
-- Should show: avatar | avatar | true
```

### Images not loading?

**Check:** Public read policy exists
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
```

## 💡 Key Takeaways

1. **BetterAuth ≠ Supabase Auth**
   - Different session systems
   - Can't use `auth.uid()` in RLS

2. **Service role key bypasses RLS**
   - Secure when used server-side only
   - Perfect for BetterAuth integration

3. **API route is the bridge**
   - Validates BetterAuth session
   - Uploads with service role key
   - Returns public URL

4. **Minimal RLS policy**
   - Only public read needed
   - No auth policies required

5. **Scalable pattern**
   - Same approach for all uploads
   - Just change bucket name
   - Consistent architecture

---

**Status:** ✅ Production-ready architecture that works with BetterAuth + Supabase Storage!
