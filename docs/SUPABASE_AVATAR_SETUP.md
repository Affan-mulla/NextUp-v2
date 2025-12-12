# Supabase Avatar Upload System - Setup Guide

## 🎯 Overview

Production-ready avatar upload system using Supabase Storage for Next.js 14+ applications.

**Features:**
- ✅ Client-side uploads to Supabase Storage
- ✅ Automatic file validation (size, type)
- ✅ Organized storage: `avatars/{userId}/{timestamp}-{filename}`
- ✅ Public URL generation
- ✅ Old avatar cleanup on new upload
- ✅ Comprehensive error handling
- ✅ TypeScript type safety

## 📋 Prerequisites

1. **Supabase Project**: Create at [supabase.com](https://supabase.com)
2. **Environment Variables**: Get from Supabase Dashboard
3. **Storage Bucket**: Create `avatars` bucket

## 🚀 Setup Steps

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name: `avatars`
5. **Public bucket**: ✅ Yes (check this box)
6. Click **Create Bucket**

### Step 2: Configure RLS Policies

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Step 3: Add Environment Variables

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: Never commit `.env.local` to version control!

### Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### Step 5: Verify Setup

Test the upload by:

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/settings/general`

3. Try uploading an avatar

4. Check Supabase Dashboard → Storage → `avatars` bucket to see the uploaded file

## 📁 File Structure

```
lib/
├── supabase/
│   ├── client.ts           # Browser-safe client (uses anon key)
│   └── server.ts           # Server client (uses service role key)
├── utils/
│   ├── upload-avatar.ts    # Upload utility
│   └── delete-avatar.ts    # Cleanup utility
└── actions/
    └── update-general-info.ts  # Server action with cleanup

components/
└── Settings/
    └── GeneralSettingsForm.tsx  # Form with upload integration
```

## 🔧 Usage Examples

### Upload Avatar

```tsx
import { uploadAvatar } from "@/lib/utils/upload-avatar";

const result = await uploadAvatar(file, userId);

if (result.success) {
  console.log("Uploaded:", result.url);
  console.log("Path:", result.path);
} else {
  console.error("Error:", result.error);
}
```

### Delete Avatar

```tsx
import { deleteAvatar } from "@/lib/utils/delete-avatar";

const result = await deleteAvatar("userId/1234567890-avatar.jpg");

if (result.success) {
  console.log("Deleted successfully");
}
```

### Server Action Integration

```tsx
import { updateGeneralInfo } from "@/lib/actions/update-general-info";

const result = await updateGeneralInfo({
  name: "John Doe",
  username: "johndoe",
  avatar: "https://supabase.co/storage/v1/object/public/avatars/user123/avatar.jpg",
});
```

## 🛡️ Security Best Practices

### Client vs Server

**Client-side (`lib/supabase/client.ts`):**
- ✅ Use for file uploads
- ✅ Uses anon key (safe in browser)
- ✅ Restricted by RLS policies

**Server-side (`lib/supabase/server.ts`):**
- ✅ Use for deletions and admin operations
- ✅ Uses service role key (bypasses RLS)
- ❌ NEVER import in client components

### RLS Policies

The policies ensure:
- Users can only upload to their own folder (`avatars/{userId}/`)
- Users can only delete their own avatars
- Anyone can view avatars (public bucket)

## 🔍 Troubleshooting

### Upload Fails: "Bucket not found"

**Solution:** Create the `avatars` bucket in Supabase Dashboard

### Upload Fails: "Permission denied"

**Solution:** 
1. Check RLS policies are enabled
2. Verify user is authenticated
3. Ensure bucket is public

### Old avatars not deleting

**Solution:** 
- This is non-critical (fire-and-forget)
- Check server logs for deletion errors
- Manually clean up via Supabase Dashboard if needed

### Environment variables not found

**Solution:**
1. Restart development server after adding `.env.local`
2. Verify variable names match exactly
3. No quotes needed around values

### Public URL returns 404

**Solution:**
1. Ensure bucket is marked as **Public**
2. Check file actually uploaded (view in Dashboard)
3. Verify path is correct

## 📊 Storage Organization

```
avatars/
├── user-id-1/
│   ├── 1702345678901-profile.jpg
│   └── 1702345678902-avatar.png
├── user-id-2/
│   └── 1702345678903-headshot.webp
└── user-id-3/
    └── 1702345678904-photo.jpg
```

**Benefits:**
- Easy user identification
- Organized by user
- Timestamp prevents collisions
- Easy bulk deletion per user

## 🧹 Cleanup Strategies

### Automatic (Implemented)

Old avatars are automatically deleted when uploading a new one.

### Manual Cleanup Script

Create a cron job or scheduled function:

```typescript
import { deleteAllUserAvatars } from "@/lib/utils/delete-avatar";

// Delete all avatars for inactive users
async function cleanupInactiveUsers() {
  const inactiveUsers = await getInactiveUsers(); // Your query
  
  for (const user of inactiveUsers) {
    await deleteAllUserAvatars(user.id);
  }
}
```

## 📈 Production Checklist

- [ ] Created `avatars` bucket in Supabase
- [ ] Set bucket to **Public**
- [ ] Added RLS policies
- [ ] Added environment variables
- [ ] Tested upload in development
- [ ] Tested deletion works
- [ ] Verified public URLs work
- [ ] Added monitoring/error tracking
- [ ] Set up backup strategy (optional)
- [ ] Configured CDN (optional)

## 🔗 Related Documentation

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Settings General Page Docs](./SETTINGS_GENERAL.md)

## 🆘 Support

**Common Issues:**

1. **File too large** → Max 4MB (configurable in `upload-avatar.ts`)
2. **Invalid file type** → Only JPG, PNG, WebP, SVG allowed
3. **Upload timeout** → Check network connection
4. **Permission errors** → Verify RLS policies

**Need Help?**
- Check Supabase Dashboard logs
- Review browser console errors
- Verify environment variables
- Test with Supabase API directly

---

**Status**: ✅ Production Ready

Your avatar upload system is now configured and ready to use!
