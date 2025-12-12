# BetterAuth + Supabase Avatar Upload - Quick Setup

## ⚡ 3-Step Setup

### 1. Run SQL in Supabase

Copy and paste this into Supabase SQL Editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Make bucket public
UPDATE storage.buckets SET public = true WHERE id = 'avatar';

-- Drop old RLS policies (if any)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Create new public read policy
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatar');
```

### 2. Verify Environment Variables

Check `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Restart Dev Server

```bash
# Kill and restart
npm run dev
```

## ✅ Test It

1. Navigate to `/settings/general`
2. Click avatar upload
3. Select image (< 4MB, JPG/PNG/WebP/SVG)
4. Should upload successfully
5. Check Supabase Dashboard → Storage → `avatar` bucket

## 📁 Files Changed

```
✅ app/api/upload/avatar/route.ts          (NEW - API route)
✅ lib/utils/upload-avatar.ts              (UPDATED - API client)
✅ components/Settings/GeneralSettingsForm.tsx  (UPDATED - removed userId param)
✅ lib/utils/delete-avatar.ts              (UPDATED - bucket name)
✅ prisma/migrations/supabase_avatar_rls_policies.sql  (NEW - SQL policies)
✅ docs/BETTERAUTH_SUPABASE_ARCHITECTURE.md  (NEW - full guide)
```

## 🔍 How It Works

```
1. Client → /api/upload/avatar (FormData)
2. API validates BetterAuth session
3. API uploads with service role key (bypasses RLS)
4. Returns public URL
```

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| 403 RLS error | Run SQL setup step 1 |
| Bucket not found | Create `avatar` bucket (public) |
| Unauthorized | Check BetterAuth session |
| Env vars missing | Add service role key, restart server |

## 📊 File Structure

```
Storage: avatar/
  └── {userId}/
      └── {timestamp}-{filename}.jpg
```

Example: `avatar/user123/1702345678901-profile.jpg`

## 🔐 Why This Architecture?

**Problem:** BetterAuth ≠ Supabase Auth
- `auth.uid()` doesn't work
- Can't use RLS with BetterAuth JWTs

**Solution:** API route with service role key
- BetterAuth validates session
- Service role uploads (bypasses RLS)
- Secure (key stays on server)

## 🚀 Usage Example

```tsx
import { uploadAvatar } from "@/lib/utils/upload-avatar";

const result = await uploadAvatar(file);
if (result.success) {
  console.log(result.url);
}
```

## ✨ What Changed

**Before (❌ Failed):**
- Client uploaded directly to Supabase
- RLS checked `auth.uid()` (null with BetterAuth)
- Got 403 RLS policy error

**After (✅ Works):**
- Client sends to API route
- API validates BetterAuth session
- API uses service role key (bypasses RLS)
- Returns public URL

## 📚 Full Documentation

See [BETTERAUTH_SUPABASE_ARCHITECTURE.md](./BETTERAUTH_SUPABASE_ARCHITECTURE.md) for complete details.

---

**Status:** ✅ Ready to use after running SQL setup!
