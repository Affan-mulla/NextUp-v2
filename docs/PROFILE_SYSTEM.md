# Profile System Documentation

## Architecture

The profile system is built with Next.js App Router following these principles:

- **Server-first data fetching** with React cache
- **Client-side pagination** with TanStack Query infinite queries
- **Lazy loading tabs** for optimal performance
- **Access control** at both API and UI levels
- **Type-safe** end-to-end with TypeScript
- **Optimized Prisma queries** with proper indexes

## Routes

### Public Routes
- `GET /api/profile/[username]/posts` - User's posts
- `GET /api/profile/[username]/comments` - User's comments

### Protected Routes (Owner Only)
- `GET /api/profile/[username]/upvotes` - User's upvoted posts
- `GET /api/profile/[username]/downvotes` - User's downvoted posts

## Files Structure

```
app/
  (user)/u/[username]/
    page.tsx              # Server component - profile header
    loading.tsx           # Loading skeleton
    not-found.tsx         # 404 page
  api/profile/[username]/
    posts/route.ts        # Public API
    comments/route.ts     # Public API
    upvotes/route.ts      # Protected API
    downvotes/route.ts    # Protected API

components/profile/
  ProfileTabs.tsx         # Client tabs wrapper with lazy loading
  PostsTab.tsx            # Infinite scroll posts
  CommentsTab.tsx         # Infinite scroll comments
  UpvotesTab.tsx          # Infinite scroll upvotes (protected)
  DownvotesTab.tsx        # Infinite scroll downvotes (protected)
  PostSkeleton.tsx        # Loading skeleton
  CommentSkeleton.tsx     # Loading skeleton
  VoteSkeleton.tsx        # Loading skeleton

lib/utils/
  profile-queries.ts      # Optimized Prisma queries with cache

types/
  profile.ts              # TypeScript interfaces
```

## Data Flow

1. **Server Component** (`page.tsx`)
   - Fetches profile data via `getUserProfile(username)`
   - Uses React `cache()` for deduplication
   - Generates SEO metadata
   - Checks auth to determine tab visibility

2. **Client Tabs** (`ProfileTabs.tsx`)
   - Lazy loads tab components
   - Shows 2 tabs (Posts, Comments) for visitors
   - Shows 4 tabs (Posts, Comments, Upvotes, Downvotes) for owner

3. **Tab Components**
   - Use TanStack Query infinite queries
   - Cursor-based pagination
   - Sort by latest/top
   - Optimistic loading states

4. **API Routes**
   - Public routes: No auth required
   - Protected routes: Verify session and ownership
   - Return paginated data with `nextCursor`

## Database Indexes

Added indexes to prevent N+1 queries:

```prisma
model Votes {
  @@index([userId, type])
  @@index([ideaId, type])
  @@index([createdAt(sort: Desc)])
}

model CommentVotes {
  @@index([userId, type])
  @@index([commentId, type])
  @@index([createdAt(sort: Desc)])
}

model Comments {
  @@index([userId])
  @@index([ideaId])
  @@index([postId])
  @@index([createdAt(sort: Desc)])
}
```

## Security

### IDOR Protection
- Profile data is fetched by **username** not userId
- Upvotes/downvotes require session validation
- API checks: `profileUser.id === session.user.id`
- 403 Forbidden for unauthorized access

### Edge Safety
- All routes compatible with Edge Runtime
- No Node.js-specific APIs
- Optimized for Vercel deployment

## Performance Optimizations

1. **React cache()** - Deduplicates profile fetches during SSR
2. **Lazy loading** - Tab components load on demand
3. **Cursor pagination** - Efficient for large datasets
4. **Indexed queries** - Fast database lookups
5. **Parallel queries** - `Promise.all` for aggregations
6. **Suspense boundaries** - Progressive loading

## Usage Example

```tsx
// Navigate to profile
<Link href="/u/johndoe">@johndoe</Link>

// Profile URL
/u/johndoe

// API endpoints
GET /api/profile/johndoe/posts?cursor=abc&sortBy=latest&limit=10
GET /api/profile/johndoe/comments?cursor=xyz&sortBy=top&limit=10
GET /api/profile/johndoe/upvotes?cursor=def&sortBy=latest&limit=10
GET /api/profile/johndoe/downvotes?cursor=ghi&sortBy=top&limit=10
```

## Query Keys

TanStack Query keys for cache management:

```typescript
["profile-posts", username, sortBy]
["profile-comments", username, sortBy]
["profile-upvotes", username, sortBy]
["profile-downvotes", username, sortBy]
```

## Metadata Generation

Dynamic SEO metadata:

```typescript
{
  title: "John Doe (@johndoe)",
  description: "View John Doe's profile. 42 posts, 128 comments.",
  openGraph: {
    title: "John Doe (@johndoe)",
    description: "View John Doe's profile",
    images: ["/avatar.jpg"]
  }
}
```

## Error Handling

- 404: User not found → `notFound()`
- 401: Not authenticated → `{ error: "Unauthorized" }`
- 403: Wrong user → `{ error: "Forbidden" }`
- 500: Server error → `{ error: "Failed to fetch..." }`
