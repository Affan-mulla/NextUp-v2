# Quick Start Guide - Ideas Feed System

## Prerequisites

Ensure you have:
- Next.js 15+ installed
- Supabase project set up
- Prisma schema configured
- Environment variables set

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
```

## Installation Steps

### 1. Ensure Dependencies are Installed

```bash
npm install @tanstack/react-query@latest
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns
```

### 2. Database Setup

Make sure your Prisma schema is synced:

```bash
npx prisma generate
npx prisma db push
```

### 3. Create Indexes for Performance

Run these SQL commands in Supabase SQL Editor:

```sql
-- Index for efficient idea fetching by creation date
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON "Ideas"("createdAt" DESC);

-- Index for efficient vote lookups
CREATE INDEX IF NOT EXISTS idx_votes_user_idea ON "Votes"("userId", "ideaId");

-- Index for efficient comment counting
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON "Comments"("ideaId");
```

### 4. Verify File Structure

Ensure all files are created:

```
✓ lib/supabase/ideas.ts
✓ hooks/useIdeas.ts
✓ app/api/ideas/route.ts
✓ app/api/ideas/vote/route.ts
✓ components/feed/IdeaCard.tsx
✓ components/feed/IdeaWrapper.tsx
✓ components/feed/IdeaCardSkeleton.tsx
✓ components/feed/ErrorState.tsx
✓ app/(user)/page.tsx
✓ components/providers/react-query-provider.tsx
```

### 5. Test the System

#### Start Development Server

```bash
npm run dev
```

#### Visit the Homepage

Navigate to `http://localhost:3000`

#### Expected Behavior:
- ✅ Page loads instantly with ideas (no loading flicker)
- ✅ Ideas display with proper formatting
- ✅ Upvote/downvote buttons respond immediately
- ✅ Scroll down to trigger infinite load
- ✅ "Load more" button appears at bottom

## Testing Checklist

### 1. Initial Load
- [ ] Page renders without loading skeleton (server-rendered)
- [ ] Ideas show correct author, time, title, image
- [ ] Vote counts display correctly
- [ ] Comment counts display correctly

### 2. Voting
- [ ] Click upvote - UI updates immediately
- [ ] Click upvote again - removes vote
- [ ] Click downvote after upvote - changes vote type
- [ ] Refresh page - vote persists
- [ ] Try voting when logged out - appropriate error handling

### 3. Infinite Scroll
- [ ] Scroll to bottom - new ideas load automatically
- [ ] "Load more" button appears and works
- [ ] Loading spinner shows during fetch
- [ ] "End of feed" message appears when no more items

### 4. Error Handling
- [ ] Network error shows error state
- [ ] Retry button works
- [ ] Empty feed shows empty state
- [ ] Malformed data handled gracefully

### 5. Performance
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] No layout shift during load
- [ ] Smooth scrolling on mobile

## Troubleshooting

### Issue: "Unauthorized" error when voting

**Solution:**
Check if user is authenticated. The voting API requires authentication.

```tsx
// Check auth status
import { createClient } from "@/utils/supabase/supabase-client";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect to login
  router.push("/auth/sign-in");
}
```

### Issue: Ideas not loading

**Solution:**
Check Supabase connection and table name:

```typescript
// Verify table exists
const { data, error } = await supabase
  .from("Ideas")
  .select("*")
  .limit(1);

console.log(data, error);
```

### Issue: Hydration mismatch

**Solution:**
Ensure server and client render the same data:

```tsx
// Make sure dates are consistently formatted
const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
```

### Issue: TypeScript errors

**Solution:**
Regenerate Prisma client:

```bash
npx prisma generate
```

Restart TypeScript server in VS Code:
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- Type "TypeScript: Restart TS Server"

## Seed Test Data (Optional)

Create some test ideas:

```typescript
// scripts/seed-ideas.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error("No user found. Create a user first.");
    return;
  }
  
  for (let i = 1; i <= 20; i++) {
    await prisma.ideas.create({
      data: {
        title: `Test Idea ${i}`,
        description: { text: `Description for idea ${i}` },
        userId: user.id,
        votesCount: Math.floor(Math.random() * 100),
      },
    });
  }
  
  console.log("✅ Seeded 20 test ideas");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
```

Run it:
```bash
npx tsx scripts/seed-ideas.ts
```

## Next Steps

1. **Add Authentication Guards**: Redirect unauthenticated users trying to vote
2. **Implement Comments**: Add comment section to ideas
3. **Add Filters**: Filter by date, popularity, author
4. **Optimize Images**: Use Next.js Image optimization
5. **Add Analytics**: Track views, clicks, votes
6. **Implement Search**: Full-text search for ideas

## Support

For issues or questions:
- Check the main documentation: `IDEAS_FEED_SYSTEM.md`
- Review Supabase logs in dashboard
- Check browser console for client errors
- Review server logs for API errors

## Performance Tips

### Optimize Supabase Queries
```typescript
// Only select needed fields
.select('id, title, createdAt, votesCount, author:User!userId(username, image)')
```

### Add Proper Indexes
```sql
CREATE INDEX idx_ideas_created_at ON "Ideas"("createdAt" DESC);
```

### Enable Caching
```typescript
// In API routes
headers: {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
}
```

### Use Image Optimization
```tsx
<Image
  src={image}
  alt={title}
  fill
  loading="lazy"
  quality={75}
/>
```

## Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Analytics configured
- [ ] SEO metadata added
- [ ] Performance tested with Lighthouse
- [ ] Mobile responsiveness verified
- [ ] Rate limiting implemented on API routes
- [ ] CORS configured if needed
- [ ] Error boundaries in place

## Success! 🎉

Your Ideas feed system is now ready. Users can:
- Browse ideas with instant load
- Vote on ideas with optimistic updates
- Scroll infinitely through content
- Enjoy a premium UX with smooth transitions

Happy building! 🚀
