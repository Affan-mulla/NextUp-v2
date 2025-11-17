# Ideas Feed System - Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               React Components (Client)                   │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  IdeaWrapper (Infinite Scroll + Vote Handler)      │  │  │
│  │  │    └─> IdeaCard × N (Optimistic UI)                │  │  │
│  │  │    └─> IdeaCardSkeleton (Loading)                   │  │  │
│  │  │    └─> ErrorState (Error Handling)                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          ▲                                │  │
│  │                          │                                │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         React Query (TanStack Query v5)            │  │  │
│  │  │  - useIdeas() → InfiniteQuery                      │  │  │
│  │  │  - useVoteIdea() → Mutation + Optimistic Updates   │  │  │
│  │  │  - Cache Management (staleTime: 5min)              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER (App Router)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Server Components                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  app/(user)/page.tsx                                │  │  │
│  │  │    - Pre-fetch ideas with getIdeas()               │  │  │
│  │  │    - Hydrate QueryClient                            │  │  │
│  │  │    - dehydrate() → HydrationBoundary               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (Route Handlers)                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  GET /api/ideas?cursor=X&limit=10                  │  │  │
│  │  │    - Fetch paginated ideas                          │  │  │
│  │  │    - Return: { ideas, nextCursor, hasMore }        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  POST /api/ideas/vote                               │  │  │
│  │  │    - Body: { ideaId, type: "UP" | "DOWN" }        │  │  │
│  │  │    - Toggle vote logic                              │  │  │
│  │  │    - Update votesCount                              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Server Utils                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  lib/supabase/ideas.ts                              │  │  │
│  │  │    - getIdeas(cursor, limit)                        │  │  │
│  │  │    - getIdeaById(id)                                │  │  │
│  │  │    - React cache() wrapper                          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SUPABASE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Ideas    │  │   Votes    │  │  Comments  │         │  │
│  │  ├────────────┤  ├────────────┤  ├────────────┤         │  │
│  │  │ id         │  │ id         │  │ id         │         │  │
│  │  │ title      │  │ userId     │  │ content    │         │  │
│  │  │ description│  │ ideaId     │  │ userId     │         │  │
│  │  │ images[]   │  │ type       │  │ ideaId     │         │  │
│  │  │ userId     │  │ createdAt  │  │ createdAt  │         │  │
│  │  │ votesCount │  └────────────┘  └────────────┘         │  │
│  │  │ createdAt  │       │                 │                │  │
│  │  │ updatedAt  │       │                 │                │  │
│  │  └────────────┘       │                 │                │  │
│  │       │               │                 │                │  │
│  │       └───────────────┴─────────────────┘                │  │
│  │                                                           │  │
│  │  ┌────────────┐                                          │  │
│  │  │   User     │                                          │  │
│  │  ├────────────┤                                          │  │
│  │  │ id         │                                          │  │
│  │  │ username   │                                          │  │
│  │  │ name       │                                          │  │
│  │  │ image      │                                          │  │
│  │  └────────────┘                                          │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Indexes (Performance)                        │  │
│  │  - idx_ideas_created_at (Ideas.createdAt DESC)           │  │
│  │  - idx_votes_user_idea (Votes.userId, Votes.ideaId)     │  │
│  │  - idx_comments_idea_id (Comments.ideaId)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### 1. Initial Page Load (Server-Side Rendering)

```
┌──────────┐
│  Browser │
└────┬─────┘
     │ 1. GET /
     ▼
┌──────────────────────┐
│ Next.js Server       │
│ (Server Component)   │
├──────────────────────┤
│ page.tsx             │
│  - Create QueryClient│
│  - prefetchInfinite  │
│  - getIdeas()        │
└────┬─────────────────┘
     │ 2. Supabase Query
     ▼
┌──────────────────────┐
│ Supabase             │
│  SELECT * FROM Ideas │
│  ORDER BY createdAt  │
│  LIMIT 10            │
└────┬─────────────────┘
     │ 3. Return ideas[]
     ▼
┌──────────────────────┐
│ Next.js Server       │
│  - dehydrate(client) │
│  - Serialize state   │
└────┬─────────────────┘
     │ 4. HTML + hydrated data
     ▼
┌──────────────────────┐
│  Browser             │
│  - Instant render    │
│  - No loading flicker│
└──────────────────────┘
```

### 2. Client-Side Pagination (Infinite Scroll)

```
┌──────────┐
│  Browser │
│ (Scroll) │
└────┬─────┘
     │ 1. IntersectionObserver triggers
     ▼
┌──────────────────────┐
│ React Query          │
│  useIdeas()          │
│  - fetchNextPage()   │
└────┬─────────────────┘
     │ 2. GET /api/ideas?cursor=X
     ▼
┌──────────────────────┐
│ API Route            │
│  - Parse cursor      │
│  - getIdeas(cursor)  │
└────┬─────────────────┘
     │ 3. Supabase Query
     ▼
┌──────────────────────┐
│ Supabase             │
│  WHERE createdAt < X │
│  LIMIT 10            │
└────┬─────────────────┘
     │ 4. Return next page
     ▼
┌──────────────────────┐
│ React Query          │
│  - Append to cache   │
│  - Update UI         │
└────┬─────────────────┘
     │ 5. Render new cards
     ▼
┌──────────────────────┐
│  Browser             │
│  - Smooth append     │
└──────────────────────┘
```

### 3. Voting Flow (Optimistic Updates)

```
┌──────────┐
│  Browser │
│ (Click ▲)│
└────┬─────┘
     │ 1. voteIdea({ ideaId, type: "UP" })
     ▼
┌──────────────────────────────────────────┐
│ React Query Mutation                     │
│  onMutate:                               │
│   - Cancel ongoing queries               │
│   - Snapshot current data                │
│   - Update cache optimistically          │
│   - votesCount + 1                       │
│   - userVote = { type: "UP" }           │
└────┬─────────────────────────────────────┘
     │ 2. UI updates INSTANTLY
     ▼
┌──────────────────────┐
│  Browser             │
│  - Green button      │
│  - Count +1          │
└──────────────────────┘
     │
     │ 3. POST /api/ideas/vote (background)
     ▼
┌──────────────────────┐
│ API Route            │
│  - Verify auth       │
│  - Check existing    │
│  - Toggle logic      │
└────┬─────────────────┘
     │ 4. Database update
     ▼
┌──────────────────────┐
│ Supabase             │
│  INSERT INTO Votes   │
│  UPDATE Ideas        │
│  votesCount + 1      │
└────┬─────────────────┘
     │ 5. Success response
     ▼
┌──────────────────────┐
│ React Query          │
│  onSuccess:          │
│   - Invalidate cache │
│   - Persist change   │
└────┬─────────────────┘
     │ 6. Confirmed
     ▼
┌──────────────────────┐
│  Browser             │
│  - State persisted   │
└──────────────────────┘

     If Error:
     onError:
       - Rollback to snapshot
       - Show error message
```

## Component Hierarchy

```
app/(user)/page.tsx (Server Component)
├─ HydrationBoundary (pre-hydrated state)
│  └─ IdeaWrapper (Client Component)
│     ├─ IdeaFeedSkeleton (Loading)
│     ├─ ErrorState (Error)
│     ├─ EmptyState (No data)
│     └─ IdeaCard × N (Idea items)
│        ├─ Avatar + AvatarFallback
│        ├─ Card + CardHeader
│        ├─ CardContent
│        │  ├─ CardTitle
│        │  └─ Image (lazy loaded)
│        └─ CardFooter
│           ├─ CardAction (Votes)
│           │  ├─ Button (Upvote)
│           │  ├─ Vote Count
│           │  └─ Button (Downvote)
│           └─ CardAction (Comments)
│              └─ Comment Count
```

## State Management Flow

```
┌────────────────────────────────────────────────────────┐
│                React Query Cache                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  queryKey: ["ideas"]                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ pages: [                                          │ │
│  │   { ideas: [...], nextCursor: "2025-11-07..." }, │ │
│  │   { ideas: [...], nextCursor: "2025-11-06..." }, │ │
│  │   { ideas: [...], nextCursor: null }              │ │
│  │ ]                                                 │ │
│  │ pageParams: [undefined, "2025-11-07...", ...]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Config:                                               │
│  - staleTime: 5 minutes                               │
│  - gcTime: 30 minutes                                 │
│  - refetchOnWindowFocus: false                        │
│                                                        │
└────────────────────────────────────────────────────────┘
                      ▲         │
                      │         │
         Cache Hit ───┘         └─── Cache Miss
                                     (API fetch)
```

## Caching Strategy

```
Request Timeline:

0s   ──────────────────────────────────────────────
     │ Server Pre-fetch (SSR)
     │ ✓ Data rendered in HTML
     │
     ├─ Page Load (Client Hydration)
     │ ✓ React Query hydrates with server data
     │ ✓ No loading state
     │
5min ├─ Stale Time Expires
     │ ✓ Data considered stale
     │ ✓ Background refetch on next usage
     │
30min├─ Cache Time (GC) Expires
     │ ✓ Data removed from memory
     │ ✓ Fresh fetch required
     │
──────────────────────────────────────────────────

Cache Invalidation Triggers:
- Manual: refetch() called
- Mutation: vote submission
- Window Focus: disabled
- Interval: none set
```

## Error Handling Flow

```
┌─────────────────┐
│ Operation Start │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Try    │
    └───┬────┘
        │
        ├─ Success ──────────────┐
        │                        │
        └─ Error ────┐           │
                     ▼           ▼
              ┌──────────┐  ┌─────────┐
              │ onError  │  │onSuccess│
              └────┬─────┘  └────┬────┘
                   │             │
        ┌──────────┴──────┐      │
        │ - Rollback      │      │
        │ - Show toast    │      │
        │ - Log error     │      │
        │ - Retry option  │      │
        └──────────┬──────┘      │
                   │             │
                   └─────────────┘
                         │
                    ┌────▼────┐
                    │ Settled │
                    └─────────┘
```

## Performance Optimization Points

```
┌──────────────────────────────────────────────────┐
│              Performance Strategy                │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Server-Side                                  │
│     ✓ Pre-fetch on server                       │
│     ✓ Minimal field selection                   │
│     ✓ Database indexes                           │
│     ✓ Cache-Control headers                      │
│                                                  │
│  2. Client-Side                                  │
│     ✓ React Query caching                       │
│     ✓ Optimistic updates                        │
│     ✓ Lazy image loading                        │
│     ✓ Intersection Observer                     │
│                                                  │
│  3. Network                                      │
│     ✓ Cursor pagination                         │
│     ✓ Minimal payload size                      │
│     ✓ HTTP/2 multiplexing                       │
│     ✓ CDN for static assets                     │
│                                                  │
│  4. Bundle                                       │
│     ✓ Code splitting                            │
│     ✓ Tree shaking                              │
│     ✓ Dynamic imports                           │
│     ✓ "use client" boundary                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────┐
│           Security Architecture            │
├────────────────────────────────────────────┤
│                                            │
│  Layer 1: Client                           │
│  └─ Input validation                       │
│  └─ XSS protection (React auto-escapes)    │
│                                            │
│  Layer 2: API Routes                       │
│  └─ Authentication check                   │
│  └─ Authorization verification             │
│  └─ Request validation                     │
│                                            │
│  Layer 3: Database (Supabase)              │
│  └─ Row Level Security (RLS)               │
│  └─ SQL injection protection (Prisma)      │
│  └─ Unique constraints                     │
│  └─ Foreign key constraints                │
│                                            │
└────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────┐
│                   Production                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────┐         ┌──────────────┐        │
│  │    Vercel    │         │   Supabase   │        │
│  │  (Next.js)   │◄───────►│ (PostgreSQL) │        │
│  └───────┬──────┘         └──────────────┘        │
│          │                                         │
│          ▼                                         │
│  ┌──────────────┐         ┌──────────────┐        │
│  │     CDN      │         │    Sentry    │        │
│  │  (Images)    │         │   (Errors)   │        │
│  └──────────────┘         └──────────────┘        │
│                                                    │
│  ┌──────────────┐         ┌──────────────┐        │
│  │   Analytics  │         │  Monitoring  │        │
│  │   (Vercel)   │         │    (Logs)    │        │
│  └──────────────┘         └──────────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: November 7, 2025
**Status**: Production Ready ✅
