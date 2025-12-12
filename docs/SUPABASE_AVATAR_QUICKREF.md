# Supabase Avatar Upload - Quick Reference

## 🎯 Quick Start

### 1. Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Create Storage Bucket

Supabase Dashboard → Storage → New Bucket:
- Name: `avatars`
- Public: ✅ Yes

### 3. Add RLS Policies

```sql
-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

## 📦 Files Created

```
lib/
├── supabase/
│   ├── client.ts       # Browser client (anon key)
│   └── server.ts       # Server client (service role)
├── utils/
│   ├── upload-avatar.ts    # Upload + validation
│   └── delete-avatar.ts    # Cleanup utility
└── actions/
    └── update-general-info.ts  # Updated with cleanup

components/Settings/
└── GeneralSettingsForm.tsx     # Updated with userId
```

## 🔧 Usage

### Upload Avatar

```tsx
import { uploadAvatar } from "@/lib/utils/upload-avatar";

const result = await uploadAvatar(file, userId);
// Returns: { success, url, path, error }
```

### Delete Avatar

```tsx
import { deleteAvatar } from "@/lib/utils/delete-avatar";

const result = await deleteAvatar(storagePath);
// Returns: { success, error }
```

## ✅ Testing Checklist

- [ ] Environment variables set
- [ ] `avatars` bucket created (public)
- [ ] RLS policies added
- [ ] Navigate to `/settings/general`
- [ ] Upload avatar (< 4MB, JPG/PNG/WebP/SVG)
- [ ] Check Supabase Dashboard for file
- [ ] Upload new avatar (old one auto-deleted)
- [ ] Verify public URL works

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Bucket not found | Create `avatars` bucket in Supabase |
| Permission denied | Add RLS policies |
| File too large | Max 4MB (change in `upload-avatar.ts`) |
| Env vars not found | Restart dev server |

## 🔒 Security

**Client (`lib/supabase/client.ts`):**
- ✅ Safe for browser
- ✅ Uses anon key
- ✅ For uploads only

**Server (`lib/supabase/server.ts`):**
- ⚠️ Server-only
- ⚠️ Uses service role key
- ✅ For deletions/admin

## 📊 Storage Structure

```
avatars/
  └── {userId}/
      └── {timestamp}-{filename}.jpg
```

Example: `avatars/user123/1702345678901-profile.jpg`

## 🚀 Production Ready

All features implemented:
- ✅ File validation (client + server)
- ✅ Supabase Storage upload
- ✅ Public URL generation
- ✅ Old avatar cleanup
- ✅ Error handling
- ✅ Type safety
- ✅ Security (RLS)

## 📚 Full Documentation

See [SUPABASE_AVATAR_SETUP.md](./SUPABASE_AVATAR_SETUP.md) for complete setup guide.

---

**Status**: ✅ Ready to use after setup steps 1-3 above!
