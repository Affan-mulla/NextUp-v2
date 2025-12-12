# Settings General - Complete File Structure

```
nextup/
│
├── app/
│   └── (user)/
│       └── settings/
│           ├── general/
│           │   ├── page.tsx              ← Main settings page (Server Component)
│           │   └── loading.tsx           ← Loading skeleton UI
│           └── account/
│               └── page.tsx              ← Existing account page
│
├── components/
│   ├── Settings/
│   │   ├── GeneralSettingsForm.tsx       ← ⭐ NEW: Form component with validation
│   │   └── General.tsx                   ← Deprecated (kept for compatibility)
│   └── ui/
│       ├── input.tsx                     ← shadcn/ui components
│       ├── textarea.tsx
│       ├── button.tsx
│       ├── avatar.tsx
│       ├── label.tsx
│       ├── separator.tsx
│       └── card.tsx
│
├── lib/
│   ├── actions/
│   │   └── update-general-info.ts        ← ⭐ NEW: Server action for updates
│   │
│   ├── validation/
│   │   ├── settings-general-schema.ts    ← ⭐ NEW: Zod schemas
│   │   ├── auth-validation.ts            ← Existing
│   │   └── idea-validation.ts            ← Existing
│   │
│   ├── utils/
│   │   ├── upload-avatar.ts              ← ⭐ NEW: Avatar upload utility
│   │   └── utils.ts                      ← Existing
│   │
│   ├── store/
│   │   └── user-store.ts                 ← Zustand store (uses updateUser)
│   │
│   ├── hooks/
│   │   └── useSession.ts                 ← Session hook (already fixed)
│   │
│   ├── auth/
│   │   ├── auth.ts                       ← Better Auth config (already fixed)
│   │   ├── auth-client.ts                ← Client auth
│   │   └── session-utils.ts              ← Session utilities (already fixed)
│   │
│   └── prisma.ts                         ← Prisma client
│
├── prisma/
│   ├── schema.prisma                     ← Database schema
│   └── migrations/
│       └── add_user_bio.sql              ← ⭐ NEW: Optional bio migration
│
├── docs/
│   ├── SETTINGS_GENERAL.md               ← ⭐ NEW: Full documentation
│   ├── SETTINGS_IMPLEMENTATION_GUIDE.md  ← ⭐ NEW: Quick start guide
│   ├── SETTINGS_SUMMARY.md               ← ⭐ NEW: Implementation summary
│   └── SETTINGS_FILE_STRUCTURE.md        ← This file
│
└── package.json                          ← All dependencies already installed

```

## 🎯 Key Files Explained

### Frontend (Client)

**`components/Settings/GeneralSettingsForm.tsx`**
- Main form component
- Uses React Hook Form + Zod
- Handles avatar upload preview
- Optimistic UI updates
- ~280 lines

**`app/(user)/settings/general/page.tsx`**
- Server component wrapper
- Renders the form inside a card
- Handles page metadata
- ~30 lines

**`app/(user)/settings/general/loading.tsx`**
- Loading skeleton UI
- Prevents layout shift
- Matches form structure
- ~60 lines

### Backend (Server)

**`lib/actions/update-general-info.ts`**
- Server action for updates
- Authentication check
- Validation (server-side)
- Database update via Prisma
- ~100 lines

### Validation & Utilities

**`lib/validation/settings-general-schema.ts`**
- Zod schemas for validation
- Client + server validation
- File validation rules
- ~60 lines

**`lib/utils/upload-avatar.ts`**
- Avatar upload logic
- File validation
- Base64 conversion (demo)
- TODO: Cloud storage integration
- ~90 lines

### Documentation

**`docs/SETTINGS_GENERAL.md`**
- Complete documentation
- API reference
- Customization guide
- Troubleshooting
- ~400 lines

**`docs/SETTINGS_IMPLEMENTATION_GUIDE.md`**
- Quick start guide
- Step-by-step walkthrough
- Testing checklist
- Common issues
- ~300 lines

**`docs/SETTINGS_SUMMARY.md`**
- Implementation summary
- Features overview
- Testing checklist
- Next steps
- ~250 lines

## 🔄 Data Flow

```
User Interaction
    ↓
GeneralSettingsForm.tsx
    ↓
React Hook Form + Zod (client validation)
    ↓
updateGeneralInfo() server action
    ↓
Zod validation (server-side)
    ↓
Better Auth session check
    ↓
Prisma database update
    ↓
Response (success/error)
    ↓
Toast notification
    ↓
Zustand store update (optimistic UI)
```

## 📦 Dependencies Used

All already installed in your project:

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation  
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives (via shadcn)
- `better-auth` - Authentication
- `@prisma/client` - Database ORM
- `zustand` - Global state

## 🚀 Quick Start

1. **Navigate to page:**
   ```
   http://localhost:3000/settings/general
   ```

2. **Test features:**
   - Update name
   - Change username  
   - Upload avatar
   - Edit bio
   - Click save

3. **Check functionality:**
   - Form validates inputs
   - Avatar preview works
   - Save updates database
   - Toast notifications show
   - Cancel resets form

## 🎨 UI Components Used

From shadcn/ui:
- `Input` - Text input fields
- `Textarea` - Multi-line bio input
- `Button` - Action buttons
- `Avatar` - Profile picture
- `Label` - Field labels
- `Separator` - Visual dividers
- `Card` - Container layout
- `Skeleton` - Loading states

## 🔧 Customization Points

### 1. Validation Rules
File: `lib/validation/settings-general-schema.ts`
- Username length (currently 3-30)
- Name length (currently 2-50)
- Bio length (currently 0-500)
- Avatar size (currently 4MB)

### 2. Upload Provider
File: `lib/utils/upload-avatar.ts`
- Currently: base64
- Production: S3, Cloudinary, Uploadthing, etc.

### 3. Form Fields
File: `components/Settings/GeneralSettingsForm.tsx`
- Add new fields
- Change layout
- Customize styling

### 4. Server Logic
File: `lib/actions/update-general-info.ts`
- Add custom validation
- Add rate limiting
- Add audit logging

## 📊 File Sizes

- GeneralSettingsForm.tsx: ~10KB
- update-general-info.ts: ~3KB
- settings-general-schema.ts: ~2KB
- upload-avatar.ts: ~3KB
- page.tsx: ~1KB
- loading.tsx: ~2KB

**Total bundle size**: ~21KB (before compression)

## 🎯 Production Checklist

Before deploying:

- [ ] Test all form fields
- [ ] Test validation errors
- [ ] Test avatar upload
- [ ] Configure cloud storage for avatars
- [ ] Add bio field to database (optional)
- [ ] Test on mobile devices
- [ ] Test dark/light mode
- [ ] Add rate limiting
- [ ] Add monitoring (Sentry)
- [ ] Test with slow network

## 📚 Related Files

**Session Management** (Already fixed):
- `lib/auth/auth.ts` - Custom session plugin
- `lib/hooks/useSession.ts` - Session hook
- `lib/auth/session-utils.ts` - Mapping utilities
- `components/Sidebar/nav-user.tsx` - Profile link

**User Store**:
- `lib/store/user-store.ts` - Zustand store
- Uses `updateUser()` for optimistic updates

**Database**:
- `prisma/schema.prisma` - User model
- `lib/prisma.ts` - Prisma client

---

**Status**: ✅ All files created and error-free!

Navigate to `/settings/general` to see your new settings page in action.
