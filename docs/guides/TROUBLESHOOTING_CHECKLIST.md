# 🔧 Image Upload Troubleshooting Checklist

## Quick Fix Steps

### Step 1: Verify Environment Variables ✅

```bash
# Check if these exist in .env.local
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $DATABASE_URL
```

**If missing:**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/db
DIRECT_URL=postgresql://user:password@localhost:5432/db
```

### Step 2: Verify Supabase Bucket 🪣

1. Go to [Supabase Dashboard](https://supabase.com)
2. Navigate to Storage → Buckets
3. Verify bucket `ideas` exists
4. Click bucket → Settings
5. Check "Make bucket public" is ✅ enabled

**If bucket doesn't exist:**
```bash
# Create via SQL
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('ideas', 'ideas', true, now(), now());
```

### Step 3: Check Database Migration 🗄️

```bash
# Apply migration
npx prisma migrate deploy

# Or generate new
npx prisma migrate dev --name fix_image_upload
```

**Verify schema:**
```bash
# Check schema has uploadedImages field
npx prisma db push
```

### Step 4: Clear Prisma Cache 🧹

```bash
# Remove cache and regenerate
rm -r node_modules/.prisma
npx prisma generate
npm install
```

### Step 5: Test Upload Flow 🧪

**Terminal 1: Start server**
```bash
npm run dev
```

**Terminal 2: Check logs**
```bash
# In browser DevTools Console, set filter
# [uploadBase64ImagesToSupabase]
# Should see logs while uploading
```

**Test in browser:**
1. Visit `http://localhost:3000/idea`
2. Enter title: "Test"
3. Add image to editor or file upload
4. Click "Create Idea"
5. **Watch console logs appear**

---

## Common Issues & Fixes

### ❌ Issue: "Supabase is not configured"

**Cause:** Environment variables not set

**Fix:**
```bash
# 1. Update .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# 2. Restart dev server
npm run dev

# 3. Clear browser cache
# DevTools → Storage → Delete all
```

---

### ❌ Issue: Images upload but don't appear in database

**Cause:** Database migration not run

**Fix:**
```bash
# 1. Check current migration status
npx prisma migrate status

# 2. Apply pending migrations
npx prisma migrate deploy

# 3. Or start fresh
npx prisma migrate reset --force
```

---

### ❌ Issue: "Bucket not configured" error

**Cause:** Supabase bucket doesn't exist or not public

**Fix:**
1. Go to Supabase Dashboard
2. Storage → Buckets
3. Create bucket named `ideas`
4. Settings → Make Public ✅
5. Restart dev server

---

### ❌ Issue: "Upload failed for [path]: 401"

**Cause:** Not authenticated or bucket has RLS policies

**Fix:**

**Option A: Disable RLS (for development)**
```bash
# In Supabase SQL editor:
ALTER PUBLICATION supabase_realtime DROP TABLE storage.objects;
```

**Option B: Setup RLS policies**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ideas');

-- Allow public read
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'ideas');
```

---

### ❌ Issue: "File exceeds 5MB" error

**Cause:** Image file too large

**Fix:**
```bash
# Compress image before upload
# Use image compression tools:
# - TinyPNG.com
# - ImageOptim
# - or reduce dimensions

# Or update max size in image-upload.ts:
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB instead of 5MB
```

---

### ❌ Issue: "No valid image files found"

**Cause:** File is not an image (wrong MIME type)

**Fix:**
```bash
# Allowed types:
# - image/png
# - image/jpeg
# - image/jpg
# - image/gif
# - image/webp

# Make sure files are actual images, not:
# - SVG (text format)
# - PDF
# - Other formats
```

---

### ❌ Issue: Console shows "Promise rejected but not caught"

**Cause:** Error in async/await chain

**Fix:**
1. Open DevTools → Console
2. Look for full error message
3. Filter by `[uploadBase64ImagesToSupabase]` or `[POST /api/ideas/create]`
4. Check error details
5. Follow specific error fix above

---

### ❌ Issue: Images upload but with wrong path

**Cause:** Filename generation issue

**Fix:**
```typescript
// Check in browser console:
console.log(generateImageFilename('image/png'));
// Should output: 1730850123456-abc123.png

// If not, verify:
// 1. Date.now() returns timestamp
// 2. Math.random() generates number
// 3. Extension extracted correctly
```

---

## Diagnostic Console Commands

Run these in browser DevTools Console to debug:

### Check Supabase Connection
```javascript
// Check if Supabase is loaded
window.supabaseClient
// Should show Supabase client object
```

### Test Base64 Extraction
```javascript
const base64Regex = /(data:image\/(png|jpeg|jpg|gif|webp);base64,([a-zA-Z0-9+/=]+))/g;
const testContent = '<img src="data:image/png;base64,iVBORw0KG..."/>';
const matches = Array.from(testContent.matchAll(base64Regex));
console.log('Found base64 images:', matches.length);
```

### Check Session
```javascript
// Test if user is authenticated
const session = await authClient.getSession();
console.log('User ID:', session.data?.user?.id);
```

### Monitor Upload Progress
```javascript
// Add to useCreateIdea hook:
console.time('Total Upload Time');
// ... uploads happen ...
console.timeEnd('Total Upload Time');
```

---

## Log Reading Guide

### ✅ Success Pattern
```
[uploadBase64ImagesToSupabase] Found 2 base64 images
[uploadBase64ImagesToSupabase] Uploading: user/editor/...
[uploadBase64ImagesToSupabase] ✅ Uploaded successfully: https://...
[uploadBase64ImagesToSupabase] ✅ All 2 uploads completed

[POST /api/ideas/create] ✅ Authenticated user: user123
[POST /api/ideas/create] ✅ Base64 upload complete: 2 images
[POST /api/ideas/create] ✅ Idea created successfully: idea_id
```

### ❌ Error Pattern
```
[uploadBase64ImagesToSupabase] ❌ Error uploading image: ...
[uploadBase64ImagesToSupabase] ❌ Fatal error: Failed to upload...

[POST /api/ideas/create] ❌ Base64 upload failed: ...
[POST /api/ideas/create] ❌ Unexpected error: ...
```

### 🔍 Look for These Keywords

- `✅` = Success
- `❌` = Error
- `⚠️` = Warning (skipped file)
- `Uploading` = Started upload
- `[uploadBase64ImagesToSupabase]` = Editor images
- `[uploadFilesToSupabase]` = File uploads
- `[POST /api/ideas/create]` = Server processing

---

## Step-by-Step Debug Process

### 1. Check Console Logs
```bash
# In DevTools Console, create test idea and look for:
✅ All log messages appear in sequence
❌ Any error message stops the flow
⚠️ Skip warnings are expected
```

### 2. Check Supabase Storage
```bash
# In Supabase Dashboard:
1. Go to Storage → ideas bucket
2. Look for folders: user123/editor/ and user123/uploads/
3. Should see .png, .jpg, .gif, .webp files
4. Files appear BEFORE database insert completes
```

### 3. Check Database
```bash
# In Supabase SQL editor:
SELECT 
  id, 
  title, 
  "uploadedImages", 
  created_at 
FROM "Ideas" 
ORDER BY created_at DESC 
LIMIT 5;

-- Check:
-- ✅ uploadedImages contains array of URLs
-- ✅ URLs start with https://...supabase.co
-- ✅ NOT containing data:image/...base64
```

### 4. Check API Response
```javascript
// In browser console after submit:
// Open DevTools → Network tab
// Find POST /api/ideas/create
// Click and view Response
// Should show:
{
  "success": true,
  "data": { id: "...", title: "...", uploadedImages: [...] },
  "message": "Idea created successfully! 🎉"
}
```

### 5. Check File Sizes
```javascript
// In browser console:
// Test file size limits
const testFile = new File(["x".repeat(6*1024*1024)], "test.png", {type: "image/png"});
console.log("File size:", testFile.size, "bytes");
// Should be ≤ 5MB (5242880 bytes)
```

---

## Reset Everything (Nuclear Option)

If nothing works, reset and start fresh:

```bash
# 1. Delete Supabase bucket
# - Supabase Dashboard → Storage
# - Delete "ideas" bucket (will recreate)

# 2. Reset database
npx prisma migrate reset --force

# 3. Clear node cache
rm -rf node_modules/.prisma
rm node_modules/.cache
npm install

# 4. Regenerate Prisma Client
npx prisma generate

# 5. Push schema again
npx prisma db push

# 6. Restart dev server
npm run dev
```

After reset, test fresh:
1. Visit `/idea` page
2. Create simple test idea with image
3. Check console logs
4. Verify in Supabase
5. Verify in database

---

## Performance Check

### Measure Upload Time

```javascript
// In useCreateIdea hook, add:
console.time('Upload Time');

const results = await Promise.all(uploadPromises);

console.timeEnd('Upload Time');
// Should show time for ALL uploads (not sum)
// Example: "Upload Time: 2.345s" for 3 concurrent files
```

### Compare Sequential vs Concurrent

**Sequential (slow):**
```
Upload 1: 1.0s
Upload 2: 1.0s
Upload 3: 1.0s
Total: 3.0s
```

**Concurrent (fast):**
```
Upload 1, 2, 3: 1.0s (all at same time)
Total: 1.0s → 3x faster
```

---

## Success Checklist ✅

Before marking as "working":

- ✅ No console errors
- ✅ Logs show all steps (8+ messages)
- ✅ Files appear in Supabase Storage
- ✅ Database has correct URLs (not base64)
- ✅ uploadedImages array populated
- ✅ description field has Supabase URLs
- ✅ Test 1: Editor base64 images
- ✅ Test 2: File upload images
- ✅ Test 3: Mixed (both types)
- ✅ Test 4: Error handling
- ✅ All in < 5 seconds total

---

## Still Stuck?

### Check These Files First

1. **`lib/supabase/image-upload.ts`**
   - Should use `Promise.all()`
   - Should have console.log() statements
   - Should throw errors (not skip)

2. **`app/api/ideas/create/route.ts`**
   - Should have 10+ numbered steps
   - Should await uploads before DB insert
   - Should log each step

3. **`hooks/useCreateIdea.ts`**
   - Should await uploadFilesToSupabase()
   - Should log errors
   - Should show progress updates

4. **`.env.local`**
   - Should have NEXT_PUBLIC_SUPABASE_URL
   - Should have NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Should have DATABASE_URL

### Enable Debug Mode

In `image-upload.ts`, add to uploadBase64ImagesToSupabase():
```typescript
console.log('[DEBUG] Processing content:', content.substring(0, 200));
console.log('[DEBUG] Found images:', base64Images.length);
console.log('[DEBUG] User ID:', userId);
```

### Test Minimal Example

```typescript
// In browser console:
import { uploadFilesToSupabase } from '@/lib/supabase/image-upload';

// Create test file
const testFile = new File(['test'], 'test.png', {type: 'image/png'});

// Upload
const urls = await uploadFilesToSupabase([testFile], 'user123');

console.log('Upload result:', urls);
```

---

## When to Ask for Help

Have ready:
1. ✅ Full console error message (screenshot)
2. ✅ Supabase Storage folder structure (screenshot)
3. ✅ Database query result (SELECT from Ideas)
4. ✅ .env.local variables (minus secrets)
5. ✅ Which step fails (upload, DB, both)
6. ✅ Any custom modifications made

---

**Good luck! 🚀 Your images will be uploading in no time.**
