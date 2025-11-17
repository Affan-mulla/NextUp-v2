# Ideas Feed System

## Overview

Production-grade feed system for displaying Ideas using Next.js 16, Supabase, and TanStack Query (React Query v5) with server-side rendering for optimal performance.

## Features

### ✨ Core Features
- **Server-Side Rendering**: Pre-hydrated data for instant UI render
- **Infinite Scroll**: Smooth pagination with intersection observer
- **Optimistic Updates**: Instant UI feedback for votes with automatic rollback on error
- **Real-time Voting**: Upvote/downvote with toggle behavior
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Support**: Seamless theme switching
- **Performance Optimized**: Lazy loading, caching, and minimal bundle size

### 🎨 UI Components
- Clean, minimal IdeaCard design
- Skeleton loading with shimmer effect
- Error boundaries with retry functionality
- Empty state handling
- Scroll restoration

## Architecture

### File Structure

```
app/
├── (user)/
│   └── page.tsx                    # Home page with server-side data fetching
├── api/
│   └── ideas/
│       ├── route.ts                # GET /api/ideas - Fetch ideas with pagination
│       └── vote/
│           └── route.ts            # POST /api/ideas/vote - Vote on ideas
components/
├── feed/
│   ├── IdeaCard.tsx                # Individual idea card with voting UI
│   ├── IdeaWrapper.tsx             # Client component with infinite scroll
│   ├── IdeaCardSkeleton.tsx        # Loading skeleton components
│   └── ErrorState.tsx              # Error and empty state components
├── providers/
│   └── react-query-provider.tsx    # React Query configuration
hooks/
└── useIdeas.ts                     # React Query hooks for ideas & voting
lib/
└── supabase/
    └── ideas.ts                    # Server-side data fetching utilities
```

### Data Flow

1. **Server Component** (`page.tsx`)
   - Fetches initial data using `getIdeas()` from Supabase
   - Prefetches data into QueryClient
   - Dehydrates state for client hydration

2. **Client Component** (`IdeaWrapper.tsx`)
   - Receives hydrated data from server
   - Uses `useIdeas()` hook for client-side updates
   - Implements infinite scroll with Intersection Observer
   - Handles vote mutations with optimistic updates

3. **API Routes**
   - `/api/ideas` - Returns paginated ideas with cursor-based pagination
   - `/api/ideas/vote` - Handles vote creation, update, and deletion

## Database Schema

### Ideas Table
```prisma
model Ideas {
  id              String    @id @default(cuid())
  title           String
  description     Json
  uploadedImages  String[]  @default([])
  userId          String
  votesCount      Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @default(now()) @updatedAt
  
  author   User       @relation(fields: [userId], references: [id])
  votes    Votes[]
  comments Comments[]
}
```

### Votes Table
```prisma
model Votes {
  id        String   @id @default(cuid())
  userId    String
  ideaId    String
  type      VoteType  // UP | DOWN
  createdAt DateTime @default(now())
  
  user User  @relation(fields: [userId], references: [id])
  idea Ideas @relation(fields: [ideaId], references: [id])
  
  @@unique([userId, ideaId])
}
```

## API Documentation

### GET /api/ideas

Fetch paginated ideas with author information.

**Query Parameters:**
- `cursor` (optional): Timestamp for cursor-based pagination
- `limit` (optional): Number of items per page (default: 10)

**Response:**
```typescript
{
  ideas: IdeaWithAuthor[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

**Example:**
```bash
GET /api/ideas?cursor=2025-11-07T10:30:00.000Z&limit=10
```

### POST /api/ideas/vote

Submit or toggle a vote on an idea.

**Request Body:**
```typescript
{
  ideaId: string;
  type: "UP" | "DOWN";
}
```

**Response:**
```typescript
{
  success: boolean;
  voteDelta: number; // Change in vote count (-2, -1, 1, or 2)
}
```

**Behavior:**
- First vote: Creates new vote, updates count by ±1
- Same vote: Removes vote, updates count by ∓1
- Different vote: Updates vote type, updates count by ±2

## React Query Configuration

### Hooks

#### `useIdeas()`
Fetches ideas with infinite pagination.

```typescript
const {
  data,              // InfiniteData<IdeasResponse>
  isLoading,         // boolean
  isError,           // boolean
  error,             // Error | null
  fetchNextPage,     // () => void
  hasNextPage,       // boolean
  isFetchingNextPage // boolean
} = useIdeas();
```

**Options:**
- `staleTime`: 5 minutes
- `gcTime`: 30 minutes
- `refetchOnWindowFocus`: false

#### `useVoteIdea()`
Handles voting with optimistic updates.

```typescript
const { mutate, isPending } = useVoteIdea();

mutate({ ideaId: "123", type: "UP" });
```

**Features:**
- Optimistic UI updates
- Automatic rollback on error
- Cache invalidation on success

## Performance Optimizations

### Server-Side
- ✅ Minimal field selection in Supabase queries
- ✅ Pre-fetching on server for instant render
- ✅ Proper database indexing (createdAt, userId, ideaId)
- ✅ Cache-Control headers on API routes

### Client-Side
- ✅ React Query caching with staleTime/gcTime
- ✅ Lazy loading images with Next.js Image
- ✅ Intersection Observer for infinite scroll
- ✅ Optimistic updates to reduce perceived latency
- ✅ Debounced scroll events

### Bundle Size
- ✅ Client components marked with "use client"
- ✅ Tree-shaking friendly imports
- ✅ Code splitting by route

## Usage Examples

### Basic Implementation

```tsx
// Server Component
import { getIdeas } from "@/lib/supabase/ideas";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import IdeaWrapper from "@/components/feed/IdeaWrapper";

export default async function Page() {
  const queryClient = new QueryClient();
  
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["ideas"],
    queryFn: async () => await getIdeas(),
    initialPageParam: undefined,
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IdeaWrapper />
    </HydrationBoundary>
  );
}
```

### Custom Vote Handler

```tsx
import { useVoteIdea } from "@/hooks/useIdeas";

function MyComponent() {
  const { mutate: voteIdea, isPending } = useVoteIdea();
  
  const handleVote = (ideaId: string, type: "UP" | "DOWN") => {
    voteIdea({ ideaId, type }, {
      onSuccess: () => {
        console.log("Vote successful!");
      },
      onError: (error) => {
        console.error("Vote failed:", error);
      }
    });
  };
  
  return <IdeaCard onVote={handleVote} isVoting={isPending} />;
}
```

## Testing

### Manual Testing Checklist
- [ ] Initial page load shows ideas instantly (no loading flicker)
- [ ] Infinite scroll loads more ideas automatically
- [ ] "Load more" button works when JavaScript is disabled
- [ ] Upvote/downvote updates UI immediately
- [ ] Vote changes persist after page refresh
- [ ] Error handling shows proper messages
- [ ] Empty state displays when no ideas exist
- [ ] Skeleton loading appears during initial load
- [ ] Dark mode works correctly
- [ ] Responsive design on mobile devices

## Future Enhancements

- [ ] Real-time updates with Supabase subscriptions
- [ ] Advanced filtering (by date, votes, author)
- [ ] Search functionality
- [ ] Comment system integration
- [ ] Share buttons for social media
- [ ] Analytics tracking
- [ ] A/B testing framework
- [ ] SEO optimization with dynamic metadata

## Troubleshooting

### Common Issues

**Issue: Data not hydrating on client**
- Ensure `HydrationBoundary` wraps client components
- Check that `dehydrate(queryClient)` is passed to state prop
- Verify queryKey matches between server and client

**Issue: Infinite scroll not triggering**
- Check that `hasNextPage` is true
- Verify Intersection Observer threshold
- Ensure loadMoreRef is attached to DOM element

**Issue: Votes not updating**
- Check authentication status
- Verify userId matches in database
- Check network tab for API errors
- Review optimistic update logic in `onMutate`

**Issue: TypeScript errors with React Query**
- Ensure all generic types are properly specified
- Update @tanstack/react-query to latest version
- Check that pageParam type matches across hooks

## Contributing

When adding new features:
1. Follow existing code structure and naming conventions
2. Add TypeScript types for all props and functions
3. Include JSDoc comments for complex logic
4. Test on both mobile and desktop
5. Verify performance with React DevTools Profiler
6. Update this README with new features

## License

This code is part of the NextUp project.
