# Create Idea Form - Implementation Guide

## Overview

This is a production-grade "Create Idea" form built with Next.js (App Router), TypeScript, TailwindCSS, and Supabase. It implements a complete end-to-end flow for creating ideas with rich text descriptions and image uploads.

## Architecture

### Core Components

#### 1. **CreateIdeaForm** (`components/forms/CreateIdeaForm.tsx`)
Main form component that orchestrates the entire creation flow.

**Features:**
- Validates title and description in real-time
- Tracks character count for title
- Shows progress indicators during submission
- Responsive dark-themed UI with shadcn/ui
- Error aggregation and display
- Form reset functionality

**Props:**
```typescript
interface CreateIdeaFormProps {
  onSuccessRedirect?: string;    // URL to redirect after success
  onSuccess?: (ideaId: string) => void;  // Callback on success
}
```

#### 2. **RichTextEditor** (`components/forms/RichTextEditor.tsx`)
Wrapper around the Lexical editor for the description field.

**Features:**
- Integrated Lexical editor
- Support for inline images (base64)
- Disabled state support
- Memoized for performance

#### 3. **ImageUpload** (`components/forms/ImageUpload.tsx`)
Advanced image upload component with drag-and-drop and preview.

**Features:**
- Drag-and-drop support
- File input fallback
- Image preview grid (2-5 columns responsive)
- Remove individual images
- Clear all functionality
- File validation (type, size)
- Loading state
- Hover overlay with remove button
- File size and type restrictions (5MB, images only)

**Props:**
```typescript
interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;          // Default: 10
  maxSizePerFile?: number;    // Default: 5 (MB)
}
```

### Hooks

#### **useCreateIdea** (`hooks/useCreateIdea.ts`)
Custom hook managing the complete idea creation flow.

**State:**
```typescript
{
  isLoading: boolean;
  isUploadingImages: boolean;
  progress: {
    current: number;      // 0-3
    total: number;        // Always 3
    stage: 'idle' | 'uploading-images' | 'submitting' | 'complete'
  }
}
```

**Method:**
```typescript
createIdea(payload: {
  title: string;
  description: SerializedEditorState;
  uploadedImages: File[];
}): Promise<CreateIdeaResponse>
```

**Flow:**
1. Validates user is authenticated
2. Uploads manually selected images to Supabase
3. Sends form data to API (which handles base64 image extraction and upload)
4. Returns success/error response
5. Triggers appropriate toast notifications

### API Route

#### **POST /api/ideas/create** (`app/api/ideas/create/route.ts`)

**Authentication:** Requires valid session (better-auth)

**Request:**
```typescript
{
  title: string;                    // 3-200 characters
  description: string;              // JSON stringified Lexical state
  uploadedImageUrls?: string[];     // Pre-signed URLs from client upload
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {                          // Full idea object
    id: string;
    title: string;
    description: object;            // Lexical JSON
    uploadedImages: string[];
    userId: string;
    votesCount: number;
    createdAt: string;
    author: { id, name, image, username }
  };
  message: string;
  error?: string;
}
```

**Process:**
1. Validates session
2. Parses and validates input
3. Extracts base64 images from Lexical editor content
4. Uploads base64 images to Supabase Storage
5. Replaces base64 URLs with Supabase public URLs
6. Stores idea with updated description in database
7. Returns created idea with author info

### Utilities

#### **Image Upload Service** (`lib/supabase/image-upload.ts`)

**Functions:**

**`uploadBase64ImagesToSupabase(content, userId)`**
- Extracts base64 images from HTML/JSON content
- Uploads to `ideas/{userId}/editor/` folder
- Returns Map of base64URL → supabaseURL

**`uploadFilesToSupabase(files, userId)`**
- Uploads File objects to Supabase
- Uploads to `ideas/{userId}/uploads/` folder
- Validates file type and size
- Returns array of public URLs

**`replaceBase64WithSupabaseUrls(content, mapping)`**
- Replaces all base64 URLs with Supabase URLs in content
- Handles special regex characters

**`isSupabaseConfigured()`**
- Checks if Supabase environment variables are set

#### **Validation Schema** (`lib/validation/idea-validation.ts`)

```typescript
CreateIdeaFormSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.record(z.string(), z.any()),
  uploadedImages: z.array(z.instanceof(File)).default([])
})

ImagesSchema = z
  .array(z.instanceof(File))
  .refine(/* all images */)
  .refine(/* each < 5MB */)
  .refine(/* max 10 files */)
```

## Database Schema

### Ideas Table

```prisma
model Ideas {
  id              String    @id @default(cuid())
  title           String
  description     Json          // Lexical editor state with Supabase URLs
  uploadedImages  String[]  @default([])  // Array of Supabase public URLs
  userId          String
  votesCount      Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @default(now()) @updatedAt

  author   User       @relation(fields: [userId], references: [id])
  votes    Votes[]
  comments Comments[]
}
```

## Image Handling Flow

### Upload Process

```
User Form
    ↓
Manual Images Selected
    ↓
Client: uploadFilesToSupabase()
    ↓
Supabase Storage: ideas/{userId}/uploads/
    ↓
Return: [URL1, URL2, URL3]
    ↓
Submit with all data + URLs
    ↓
API: /api/ideas/create
    ↓
Extract base64 from editor content
    ↓
Server: uploadBase64ImagesToSupabase()
    ↓
Supabase Storage: ideas/{userId}/editor/
    ↓
Replace base64 with URLs
    ↓
Save to database
    ↓
Return: Created idea with URLs
```

### Storage Structure

```
Supabase Storage Bucket: "ideas"
├── {userId}/
│   ├── editor/
│   │   ├── 1730814523492-abc123.jpg
│   │   ├── 1730814524501-def456.png
│   │   └── ...
│   └── uploads/
│       ├── 1730814525600-ghi789.jpg
│       ├── 1730814526700-jkl012.png
│       └── ...
```

## Usage Example

### In a page:

```tsx
"use client";

import { CreateIdeaForm } from "@/components/forms/CreateIdeaForm";

export default function Page() {
  const handleSuccess = (ideaId: string) => {
    console.log("Created idea:", ideaId);
    // Refresh ideas list, show toast, redirect, etc.
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CreateIdeaForm onSuccess={handleSuccess} />
    </div>
  );
}
```

## Configuration

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Better Auth
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### Supabase Setup

1. Create bucket named `ideas` (public)
2. Enable public read access:
   - Go to Storage → Policies
   - Allow `SELECT` for authenticated users

3. Enable file upload (RLS Policy):
```sql
CREATE POLICY "Users can upload their own ideas images"
ON storage.objects
FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

## Validation Rules

### Title
- Minimum: 3 characters
- Maximum: 200 characters
- Trimmed on submission

### Description
- Must be non-empty Lexical state
- Can contain images (inline or base64)
- Stored as JSON

### Images (Manual Upload)
- File types: PNG, JPG, GIF, WebP
- Maximum per file: 5MB
- Maximum total: 10 files
- All validated client-side and server-side

## Error Handling

The form implements comprehensive error handling:

1. **Client-side Validation**
   - React Hook Form with Zod
   - Real-time validation on blur
   - Aggregated error display

2. **Image Upload Errors**
   - File type validation
   - Size validation
   - Supabase API errors

3. **API Errors**
   - Authentication errors (401)
   - Validation errors (400)
   - Server errors (500)
   - All trigger toast notifications

4. **User Feedback**
   - Loading states on buttons
   - Progress indicator
   - Toast notifications (success/error/loading)
   - Error summary section

## Performance Optimizations

1. **Memoization**
   - RichTextEditor component is memoized
   - useCallback for all handlers

2. **Lazy Loading**
   - Suspense boundary in page
   - Dynamic editor import

3. **Image Optimization**
   - Next.js Image component in preview
   - Base64 validation before upload
   - Parallel upload optimization

4. **State Management**
   - Zustand for user store
   - React Hook Form for form state
   - Local useState for UI state

## Security Considerations

1. **Authentication**
   - All API routes require valid session
   - User ID obtained from session (not user input)

2. **File Validation**
   - MIME type validation
   - File size limits
   - Filename sanitization

3. **Database**
   - User can only create ideas for themselves
   - userId always from authenticated session

4. **Storage**
   - Files organized by userId
   - Public read, authenticated write
   - Base64 data never stored directly

## Accessibility

- ARIA labels on all inputs
- Proper label associations
- Loading state indicators
- Error messaging
- Keyboard navigation support
- Color contrast compliance

## Responsive Design

- Mobile: Single column layout
- Tablet: Two column preview grid
- Desktop: Three+ column preview grid
- Touch-friendly button sizes
- Readable font sizes

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Same as desktop

## Testing Considerations

### Unit Tests
- Validation schemas
- Image extraction function
- URL replacement function

### Integration Tests
- Form submission flow
- Image upload process
- API error handling

### E2E Tests
- Create idea with only text
- Create idea with manual images
- Create idea with editor images
- Create idea with both image types
- Error scenarios (auth, network, validation)

## Troubleshooting

### Images not uploading
1. Check Supabase URL and key in `.env`
2. Verify bucket exists and is public
3. Check RLS policies
4. Review browser console for errors

### Form not submitting
1. Check authentication status
2. Verify all required fields filled
3. Check API logs
4. Review network tab for request/response

### Images showing as broken
1. Verify Supabase URL is correct
2. Check storage permissions
3. Verify CORS settings
4. Clear browser cache

## Future Enhancements

1. **Draft Saving**
   - Auto-save to localStorage
   - Resume interrupted submissions

2. **Image Optimization**
   - Client-side compression
   - WebP conversion
   - Responsive image sizing

3. **Collaborative Editing**
   - Real-time co-authors
   - Comments on ideas
   - Version history

4. **Advanced Validation**
   - Spam detection
   - Content moderation
   - Plagiarism checking

5. **Analytics**
   - Track creation success rate
   - Monitor upload times
   - Performance metrics

## Support

For issues or questions:
1. Check this documentation
2. Review error messages and logs
3. Check Supabase dashboard
4. Review API response body
5. Contact development team
