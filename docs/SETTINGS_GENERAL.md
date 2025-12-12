# Settings → General Page

Production-grade settings page for managing user profile information in a Next.js application.

## 📁 File Structure

```
app/
└── (user)/
    └── settings/
        └── general/
            ├── page.tsx         # Main server component page
            └── loading.tsx      # Loading skeleton UI

components/
└── Settings/
    ├── GeneralSettingsForm.tsx  # Main form component
    └── General.tsx              # (Deprecated) Old component

lib/
├── validation/
│   └── settings-general-schema.ts  # Zod validation schemas
├── actions/
│   └── update-general-info.ts      # Server action for updates
└── utils/
    └── upload-avatar.ts            # Avatar upload utility
```

## 🎯 Features

### ✅ Core Functionality
- ✨ **Profile Updates**: Name, username, bio, and avatar
- 🔐 **Authentication**: Server-side session validation
- ✅ **Validation**: Client + server-side with Zod
- 📸 **Avatar Upload**: File validation and preview
- 🎨 **Modern UI**: Clean design with shadcn/ui
- 🌓 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive**: Mobile-first design

### 🛡️ Validation Rules

| Field    | Rules                                            |
|----------|--------------------------------------------------|
| Name     | Required, 2-50 characters                        |
| Username | Required, 3-30 chars, lowercase, alphanumeric    |
| Bio      | Optional, max 500 characters                     |
| Avatar   | Max 4MB, JPG/PNG/WebP/SVG only                   |

### 🎨 UI/UX Features
- Real-time validation feedback
- Loading states during submission
- Optimistic UI updates
- Avatar preview before upload
- Character counter for bio
- Disabled state for unchanged forms
- Success/error toast notifications
- Responsive 2-column → 1-column layout

## 🚀 Usage

### Basic Usage

```tsx
// In your settings page
import GeneralSettingsForm from "@/components/Settings/GeneralSettingsForm";

export default function SettingsPage() {
  return (
    <div className="container">
      <GeneralSettingsForm />
    </div>
  );
}
```

### Server Action Usage

```tsx
"use server";
import { updateGeneralInfo } from "@/lib/actions/update-general-info";

const result = await updateGeneralInfo({
  name: "Jane Doe",
  username: "janedoe",
  bio: "Product designer",
  avatar: "https://example.com/avatar.jpg"
});

if (result.success) {
  console.log("Updated:", result.data.user);
} else {
  console.error("Error:", result.error);
}
```

### Avatar Upload

```tsx
import { uploadAvatar, validateAvatarFile } from "@/lib/utils/upload-avatar";

// Validate file before upload
const validation = validateAvatarFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Upload file
const result = await uploadAvatar(file);
if (result.success) {
  console.log("Uploaded to:", result.url);
}
```

## 🔧 Configuration

### Environment Variables

No environment variables required for basic functionality.

For production avatar uploads, configure your storage provider:

```env
# Example for S3
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Example for Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Database Schema

Ensure your User model has these fields:

```prisma
model User {
  id       String  @id @default(cuid())
  name     String
  username String  @unique
  email    String  @unique
  image    String?
  bio      String? // Optional: add if you want bio support
  
  // ... other fields
}
```

**Note**: The current schema doesn't include a `bio` field. To add it:

```bash
# Add to schema.prisma
model User {
  // ... existing fields
  bio String?
}

# Run migration
npx prisma migrate dev --name add_user_bio
```

## 📝 Customization

### Styling

All components use shadcn/ui and Tailwind CSS. Customize by:

1. **Colors**: Edit `tailwind.config.ts`
2. **Components**: Modify shadcn component variants
3. **Layout**: Adjust spacing in `GeneralSettingsForm.tsx`

### Validation

Edit validation rules in `settings-general-schema.ts`:

```typescript
export const generalSettingsSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/),
  bio: z.string().max(500).optional(),
  // Add custom rules here
});
```

### Upload Provider

Replace the avatar upload logic in `upload-avatar.ts`:

```typescript
// Example: Upload to Cloudinary
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return { success: true, url: data.secure_url };
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Form loads with user data
- [ ] Name validation (2-50 chars)
- [ ] Username validation (lowercase, alphanumeric)
- [ ] Bio character counter works
- [ ] Avatar upload shows preview
- [ ] Avatar file validation (size, type)
- [ ] Form submission updates database
- [ ] Success toast appears
- [ ] Zustand store updates
- [ ] Error handling works
- [ ] Cancel button resets form
- [ ] Responsive layout works
- [ ] Dark mode works

### Automated Testing

```typescript
// Example test with React Testing Library
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeneralSettingsForm from '@/components/Settings/GeneralSettingsForm';

test('validates username format', async () => {
  render(<GeneralSettingsForm />);
  const input = screen.getByLabelText(/username/i);
  
  await userEvent.type(input, 'INVALID_USERNAME');
  await userEvent.tab();
  
  expect(screen.getByText(/must be lowercase/i)).toBeInTheDocument();
});
```

## 🐛 Troubleshooting

### Common Issues

**Form doesn't submit**
- Check if user is authenticated
- Verify server action is imported correctly
- Check browser console for errors

**Avatar upload fails**
- Verify file size < 4MB
- Check file type (JPG/PNG/WebP/SVG)
- Inspect network tab for upload errors

**Username taken error**
- Ensure username is unique in database
- Check if user is trying to use their current username

**Validation errors not showing**
- Verify Zod schema is imported
- Check React Hook Form setup
- Ensure error messages are rendered

## 🚀 Production Checklist

Before deploying to production:

- [ ] Configure cloud storage for avatars (S3/Cloudinary)
- [ ] Add rate limiting to server action
- [ ] Add CSRF protection
- [ ] Enable image optimization
- [ ] Add analytics tracking
- [ ] Test error boundaries
- [ ] Add loading states
- [ ] Test with slow 3G network
- [ ] Verify database indexes on username
- [ ] Add monitoring (Sentry, etc.)

## 📚 Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## 🤝 Contributing

To extend this settings page:

1. Add new fields to `settings-general-schema.ts`
2. Update `GeneralSettingsForm.tsx` with new inputs
3. Modify `update-general-info.ts` server action
4. Update database schema if needed
5. Add validation tests

## 📄 License

MIT License - feel free to use in your projects.
