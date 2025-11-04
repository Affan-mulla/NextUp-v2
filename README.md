This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🎉 NEW: Production-Ready Session Management

This project now includes a **comprehensive, secure session management system** using Zustand that works with **all authentication methods** (email/password, OAuth, magic links, etc.).

### ✨ Key Features
- ✅ **Universal Auth Support** - Works with GitHub OAuth, email/password, and any Better Auth provider
- ✅ **Automatic Session Hydration** - Detects and restores sessions on app mount
- ✅ **Secure Storage** - Uses sessionStorage (auto-clears on tab close)
- ✅ **Performance Optimized** - Selective re-renders with optimized selectors
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **SSR Safe** - Prevents hydration mismatches

### 📚 Quick Start
```tsx
// Get user data in any component
import { useUser } from "@/lib/store/user-store";

const user = useUser();
// { id, name, email, avatar, ... }
```

### 🔒 Protect Routes
```tsx
import { AuthGuard } from "@/components/auth/auth-guards";

<AuthGuard><YourProtectedPage /></AuthGuard>
```

### 📖 Complete Documentation
- **[Start Here: IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Overview & quick start
- **[Daily Use: QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Cheat sheet
- **[Deep Dive: SESSION_MANAGEMENT_GUIDE.md](./SESSION_MANAGEMENT_GUIDE.md)** - Complete guide
- **[Visual Docs: ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - System diagrams
- **[All Docs: SESSION_DOCS_INDEX.md](./SESSION_DOCS_INDEX.md)** - Documentation index

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
