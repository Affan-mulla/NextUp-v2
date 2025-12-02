# Profile System - Quick Reference

## 🔗 URLs

```
Profile Page:     /u/[username]
Posts API:        /api/profile/[username]/posts
Comments API:     /api/profile/[username]/comments
Upvotes API:      /api/profile/[username]/upvotes (protected)
Downvotes API:    /api/profile/[username]/downvotes (protected)
```

## 📦 Imports

```typescript
// Profile page
import { getUserProfile } from "@/lib/utils/profile-queries";

// Components
import { ProfileTabs } from "@/components/profile/ProfileTabs";

// Hooks
import { useProfilePosts, useProfileComments } from "@/hooks/useProfile";

// Types
import type { ProfileUser, ProfilePost, ProfileComment, ProfileVote } from "@/types/profile";
```

## 🎯 Usage Examples

### Server Component (Profile Page)
```typescript
import { getUserProfile } from "@/lib/utils/profile-queries";
import { notFound } from "next/navigation";

const profile = await getUserProfile(username);
if (!profile) notFound();
```

### Client Component (Using Hooks)
```typescript
import { useProfilePosts } from "@/hooks/useProfile";

const { data, fetchNextPage, hasNextPage } = useProfilePosts({
  username: "johndoe",
  sortBy: "latest",
});
```

### API Route
```typescript
import { getUserPosts } from "@/lib/utils/profile-queries";

const { posts, nextCursor } = await getUserPosts(username, cursor, limit, sortBy);
```

## 🔑 Query Keys

```typescript
["profile-posts", username, sortBy]
["profile-comments", username, sortBy]
["profile-upvotes", username, sortBy]
["profile-downvotes", username, sortBy]
```

## 🎨 Components

### ProfileTabs
```tsx
<ProfileTabs username="johndoe" isOwnProfile={true} />
```

### Individual Tab Components
```tsx
<PostsTab username="johndoe" />
<CommentsTab username="johndoe" />
<UpvotesTab username="johndoe" />
<DownvotesTab username="johndoe" />
```

## 🔒 Access Control

**Public Access:**
- Profile page: All users
- Posts tab: All users
- Comments tab: All users

**Owner Only:**
- Upvotes tab: Profile owner only
- Downvotes tab: Profile owner only

## 📊 API Parameters

```typescript
// Query Parameters
cursor?: string    // For pagination
limit?: number     // Default: 10
sortBy?: "latest" | "top"  // Default: "latest"

// Example
/api/profile/johndoe/posts?cursor=abc123&limit=20&sortBy=top
```

## 🚀 Performance Tips

1. **Server-side caching**: Use React `cache()` for deduplication
2. **Client-side caching**: TanStack Query handles it automatically
3. **Pagination**: Cursor-based is more efficient than offset
4. **Lazy loading**: Tabs load only when activated
5. **Indexes**: Ensure database indexes are applied

## 🐛 Common Issues

### Issue: "User Not Found"
**Solution**: Verify username exists in database

### Issue: "Unauthorized" on upvotes/downvotes
**Solution**: User must be logged in and viewing own profile

### Issue: Slow queries
**Solution**: Apply database indexes (see PROFILE_DEPLOYMENT.md)

### Issue: TypeScript errors
**Solution**: Run `npx prisma generate` to update types

## 📈 Monitoring

### Key Metrics to Track
- Profile page load time
- API response times
- Pagination cursor usage
- Cache hit rates
- Error rates (401, 403, 404, 500)

### Query Performance
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%Votes%' OR query LIKE '%Comments%'
ORDER BY mean_exec_time DESC;

-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE relname IN ('Votes', 'CommentVotes', 'Comments');
```

## 🔄 State Management

Profile data flows:
1. Server: `getUserProfile()` → React cache
2. Client: API → TanStack Query cache
3. UI: Query hooks → Components

No global state needed - caching handles it all.

## ✅ Testing Checklist

- [ ] Profile page loads for existing user
- [ ] 404 page shows for non-existent user
- [ ] Owner sees 4 tabs
- [ ] Visitor sees 2 tabs
- [ ] Pagination works on all tabs
- [ ] Sorting (latest/top) works
- [ ] Loading skeletons appear
- [ ] Error states handle failures
- [ ] Empty states show when no data
- [ ] Mobile responsive design works
- [ ] SEO metadata is correct
- [ ] API routes are protected correctly
