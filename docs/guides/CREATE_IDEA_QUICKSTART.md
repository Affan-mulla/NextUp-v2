# Create Idea Form - Quick Start Guide

## 🚀 Quick Implementation

### 1. Basic Usage (5 minutes)

Simply replace your page with the CreateIdeaForm component:

```tsx
// app/(user)/idea/page.tsx
"use client";

import { Suspense } from "react";
import { CreateIdeaForm } from "@/components/forms/CreateIdeaForm";

export default function CreateIdeaPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <CreateIdeaForm />
        </Suspense>
      </div>
    </div>
  );
}
```

### 2. With Success Callback

```tsx
export default function CreateIdeaPage() {
  const handleSuccess = (ideaId: string) => {
    // Redirect to idea detail page
    window.location.href = `/ideas/${ideaId}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CreateIdeaForm onSuccess={handleSuccess} />
    </div>
  );
}
```

### 3. With Redirect

```tsx
export default function CreateIdeaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <CreateIdeaForm onSuccessRedirect="/ideas" />
    </div>
  );
}
```

## 📋 Feature Checklist

- ✅ Title input with character count
- ✅ Rich text editor (Lexical)
- ✅ Inline image support in editor
- ✅ Separate image upload section
- ✅ Drag-and-drop image upload
- ✅ Image preview gallery
- ✅ Form validation (Zod + React Hook Form)
- ✅ Progress indicators
- ✅ Error handling and toasts
- ✅ Responsive design
- ✅ Dark theme support
- ✅ Loading states
- ✅ Base64 image extraction
- ✅ Supabase image upload
- ✅ Database persistence
- ✅ Authentication integration

## 🎨 UI Components Used

- `Card` - Form container
- `Button` - Submit and reset
- `Input` - Title field
- `Label` - Field labels
- `RichTextEditor` - Description editor
- `ImageUpload` - Image selector
- `Spinner/Loader2` - Loading indicators
- `Toast/Sonner` - Notifications

## 🔧 Configuration Checklist

Before using the form, ensure:

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
DATABASE_URL=your-db-url
DIRECT_URL=your-direct-db-url
```

### Database
```bash
# Run migration
npx prisma migrate dev --name add_uploaded_images_to_ideas

# Or manually run:
# ALTER TABLE "Ideas" ADD COLUMN "uploadedImages" TEXT[];
```

### Supabase Storage
1. Create bucket named `ideas`
2. Set bucket to public
3. Enable RLS policies (see docs)

### Authentication
- Ensure better-auth is configured
- User session must be available on API routes

## 📁 File Structure

```
components/
├── forms/
│   ├── CreateIdeaForm.tsx        # Main form component
│   ├── RichTextEditor.tsx        # Editor wrapper
│   └── ImageUpload.tsx           # Image upload with D&D

hooks/
└── useCreateIdea.ts             # Form submission hook

lib/
├── supabase/
│   └── image-upload.ts          # Image upload utilities
└── validation/
    └── idea-validation.ts       # Zod schemas

app/
└── api/
    └── ideas/
        └── create/
            └── route.ts         # Create idea API endpoint

prisma/
└── schema.prisma                # Updated Ideas model
```

## 🎯 Data Flow

```
User Input
    ↓
Form Validation (Client)
    ↓
Image Upload to Supabase (Client)
    ↓
API Request (POST /api/ideas/create)
    ↓
Authentication Check
    ↓
Extract Base64 Images
    ↓
Upload Editor Images (Server)
    ↓
Replace URLs in Content
    ↓
Create Idea in Database
    ↓
Return Created Idea
    ↓
Success Toast + Callback/Redirect
```

## 🐛 Common Issues & Solutions

### Issue: "Supabase is not configured"
**Solution:** Check environment variables in `.env.local`

### Issue: Images not uploading
**Solution:**
1. Verify bucket exists and is public
2. Check storage policies in Supabase
3. Review browser console for errors

### Issue: "Unauthorized" error
**Solution:**
1. Ensure user is logged in
2. Check session is valid
3. Verify better-auth is configured

### Issue: Form not validating
**Solution:**
1. Ensure title is 3-200 characters
2. Ensure description is not empty
3. Check browser console for validation errors

## 📊 State Management

### Form State (React Hook Form)
- `title` - Text input
- `description` - Lexical editor state
- `uploadedImages` - File array

### Hook State (useCreateIdea)
- `isLoading` - Form submitting
- `isUploadingImages` - Images uploading
- `progress` - Current stage and progress

### UI State (Local)
- `editorState` - Lexical editor content
- `isDragging` - Image upload hover state
- `previews` - Image preview objects

## 🔐 Authentication Flow

1. User navigates to `/idea` page
2. Page is wrapped in auth guard (in parent layout)
3. User fills form
4. On submit, `useCreateIdea` checks session
5. Client uploads images (uses session for path)
6. API request includes session in headers
7. Server validates session with better-auth
8. Creates idea with `userId` from session

## 📱 Responsive Breakpoints

- **Mobile (< 640px)**: Single column preview
- **Tablet (640px-1024px)**: 2-3 columns
- **Desktop (> 1024px)**: 4-5 columns

## ⚡ Performance Tips

1. Keep editor content under 1MB
2. Optimize images before upload (recommended 5-50KB per image)
3. Don't upload more than 10 images per idea
4. Use modern image formats (WebP)
5. Consider lazy loading ideas list

## 🧪 Testing the Form

### Manual Testing Steps

1. **Basic submission:**
   - Enter title
   - Enter description
   - Click submit
   - Verify success toast

2. **Image upload:**
   - Drag images to upload area
   - Verify preview shows
   - Submit form
   - Verify images in Supabase

3. **Validation errors:**
   - Leave title empty → error
   - Enter title < 3 chars → error
   - Empty description → error
   - File > 5MB → error

4. **Error scenarios:**
   - Disconnect network during upload
   - Logout mid-submission
   - Check error handling

## 🚀 Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Supabase bucket created
- [ ] RLS policies configured
- [ ] better-auth configured
- [ ] API routes tested
- [ ] Error logging enabled
- [ ] Performance monitoring active
- [ ] CORS configured if needed
- [ ] SSL certificates valid

## 📚 Further Reading

- [Complete Implementation Guide](./CREATE_IDEA_IMPLEMENTATION.md)
- [Zod Validation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [Lexical Editor](https://lexical.dev)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 💬 Support

For issues:
1. Check error message in toast
2. Review browser console
3. Check API response in Network tab
4. Review Supabase dashboard logs
5. Check Prisma logs

---

**Last Updated:** November 5, 2024  
**Status:** Production Ready ✅
