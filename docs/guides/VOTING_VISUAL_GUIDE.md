# Voting System - Visual Architecture Guide

## 🎨 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Page (Server)                            │
│                    app/(user)/page.tsx                           │
│                                                                   │
│  • Fetches initial ideas server-side                             │
│  • Hydrates React Query cache                                    │
│  • Passes data to IdeaWrapper                                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IdeaWrapper (Client)                          │
│             components/feed/IdeaWrapper.tsx                      │
│                                                                   │
│  • Uses useIdeas() for infinite scroll                           │
│  • Maps through ideas array                                      │
│  • Passes userVote to each card                                  │
│  • NO voting logic here                                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   IdeaCard (Client) #1   │  │   IdeaCard (Client) #2   │
│                          │  │                          │
│  • useVoteIdea() hook    │  │  • useVoteIdea() hook    │
│  • Local pendingVote     │  │  • Local pendingVote     │
│  • Isolated state        │  │  • Isolated state        │
│  • Vote buttons          │  │  • Vote buttons          │
└──────────────────────────┘  └──────────────────────────┘
        │                             │
        │                             │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │     useVoteIdea() Hook      │
        │    hooks/useVoting.ts       │
        │                             │
        │  • Optimistic update logic  │
        │  • Mutation management      │
        │  • Rollback handling        │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │    POST /api/ideas/vote      │
        │  app/api/ideas/vote/route.ts │
        │                              │
        │  • Auth validation           │
        │  • Database operations       │
        │  • Response formatting       │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │    PostgreSQL Database       │
        │                              │
        │  • Votes table               │
        │  • Ideas table               │
        │  • Atomic operations         │
        └──────────────────────────────┘
```

## 🔄 Data Flow Sequence

### Scenario 1: User Upvotes a Post

```
Step 1: User Click
┌──────────────────┐
│  User clicks     │
│  upvote button   │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ IdeaCard: handleVote("UP")                             │
│  • Sets pendingVote = "UP"                             │
│  • Calls vote({ ideaId, voteType: "UP" })              │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
Step 2: Optimistic Update (INSTANT)
┌────────────────────────────────────────────────────────┐
│ useVoteIdea: onMutate                                  │
│  • Cancel ongoing queries                              │
│  • Snapshot current cache: previousData               │
│  • Update cache optimistically:                        │
│    - votesCount: 10 → 11                               │
│    - userVote: null → { type: "UP" }                   │
│  • Return context: { previousData }                    │
└────────┬───────────────────────────────────────────────┘
         │
         ├─────────────────────────────────────────────────┐
         │                                                 │
         ▼                                                 ▼
┌────────────────────────┐              ┌─────────────────────────┐
│   UI UPDATES NOW!      │              │  Request Sends to API   │
│   (User sees change)   │              │  (Background process)   │
│                        │              │                         │
│  • Count: 11           │              │  fetch("/api/ideas/     │
│  • Button: Green       │              │    vote", {             │
│  • Active state shown  │              │    ideaId, voteType     │
└────────────────────────┘              │  })                     │
                                        └──────────┬──────────────┘
                                                   │
                                                   ▼
Step 3: Server Processing
┌────────────────────────────────────────────────────────┐
│ API Route: POST /api/ideas/vote                        │
│  • Validate session ✓                                  │
│  • Validate input ✓                                    │
│  • Check existing vote (none found)                    │
│  • CREATE new vote record                              │
│  • UPDATE ideas.votesCount += 1                        │
│  • Return: { success: true, votesCount: 11, ... }      │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
Step 4: Success Handling
┌────────────────────────────────────────────────────────┐
│ useVoteIdea: onSuccess                                 │
│  • Log success                                         │
│  • No cache update needed (already optimistic)         │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
Step 5: Settled (Background Refetch)
┌────────────────────────────────────────────────────────┐
│ useVoteIdea: onSettled                                 │
│  • Invalidate ["ideas"] query                          │
│  • Background refetch starts                           │
│  • Ensures cache matches server                        │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
Step 6: Complete
┌────────────────────────────────────────────────────────┐
│ IdeaCard: onSettled callback                           │
│  • Clear pendingVote (null)                            │
│  • Re-enable buttons                                   │
│  • User can vote again                                 │
└────────────────────────────────────────────────────────┘

Total Time Perceived by User: ~0ms (instant feedback)
Total Actual Time: ~100-300ms (server round-trip)
```

### Scenario 2: Server Error (Rollback)

```
Step 1-2: Same as above (optimistic update happens)

Step 3: Server Rejects
┌────────────────────────────────────────────────────────┐
│ API Route: POST /api/ideas/vote                        │
│  • Session expired or invalid                          │
│  • Returns: 401 Unauthorized                           │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
Step 4: Error Handling (ROLLBACK)
┌────────────────────────────────────────────────────────┐
│ useVoteIdea: onError                                   │
│  • Restore previousData to cache                       │
│  • votesCount: 11 → 10 (reverted)                      │
│  • userVote: { type: "UP" } → null (reverted)          │
│  • Log error                                           │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│   UI REVERTS AUTOMATICALLY                             │
│   • Count: 10 (back to original)                       │
│   • Button: Gray (inactive)                            │
│   • Error state shown (optional)                       │
└────────────────────────────────────────────────────────┘

Total Visible Time: ~100-300ms (brief flash of green)
End Result: UI matches server state (not voted)
```

## 🎯 Cache State Visualization

### Before Vote

```javascript
QueryCache: {
  ["ideas"]: {
    pages: [
      {
        ideas: [
          {
            id: "idea-123",
            votesCount: 10,
            userVote: null,  // ← Not voted
            // ... other fields
          },
          {
            id: "idea-456",
            votesCount: 5,
            userVote: { type: "DOWN" },  // ← Already downvoted
            // ... other fields
          }
        ],
        nextCursor: "...",
        hasMore: true
      }
    ],
    pageParams: [undefined]
  }
}
```

### During Optimistic Update

```javascript
QueryCache: {
  ["ideas"]: {
    pages: [
      {
        ideas: [
          {
            id: "idea-123",
            votesCount: 11,  // ← Incremented
            userVote: { type: "UP" },  // ← Set to UP
            // ... other fields
          },
          {
            id: "idea-456",
            votesCount: 5,  // ← Unchanged
            userVote: { type: "DOWN" },  // ← Unchanged
            // ... other fields
          }
        ],
        nextCursor: "...",
        hasMore: true
      }
    ],
    pageParams: [undefined]
  }
}

Snapshot saved in mutation context: { previousData: <original cache> }
```

### After Server Confirms

```javascript
// Cache stays the same (optimistic update was correct)
// Background refetch happens to ensure consistency

QueryCache: {
  ["ideas"]: {
    pages: [
      {
        ideas: [
          {
            id: "idea-123",
            votesCount: 11,  // ✓ Confirmed by server
            userVote: { type: "UP" },  // ✓ Confirmed by server
            // ... other fields
          },
          // ... other ideas
        ]
      }
    ]
  }
}
```

## 🔄 State Machine Diagram

```
                    ┌──────────────┐
                    │   NO VOTE    │
                    │  (Initial)   │
                    └───┬──────┬───┘
                        │      │
              Click UP  │      │  Click DOWN
                        │      │
                        ▼      ▼
              ┌──────────┐  ┌──────────┐
              │ UPVOTED  │  │DOWNVOTED │
              │ +1 vote  │  │ -1 vote  │
              └────┬─────┘  └─────┬────┘
                   │              │
         Click UP  │              │  Click DOWN
         (toggle)  │              │  (toggle)
                   │              │
                   └──────┬───────┘
                          │
                          ▼
                    ┌──────────────┐
                    │   NO VOTE    │
                    │  (Removed)   │
                    └──────────────┘

Special Transitions:
UPVOTED → Click DOWN → DOWNVOTED (-2 votes)
DOWNVOTED → Click UP → UPVOTED (+2 votes)
```

## 📊 Performance Comparison

### Before Optimistic Updates
```
User clicks → Wait for server → UI updates
│             │                 │
0ms          300ms             300ms
             
Total perceived latency: 300ms ⚠️
```

### After Optimistic Updates
```
User clicks → UI updates → Server confirms → Background refetch
│             │           │                  │
0ms          0ms         300ms              300ms

Total perceived latency: 0ms ✅
User sees change instantly!
```

## 🎨 UI State Transitions

### Upvote Button States

```
┌─────────────────────────────────────────────────────────┐
│                      NOT VOTED                          │
│  ┌─────┐                                                │
│  │  ↑  │  Gray background                               │
│  └─────┘  hover:green                                   │
│            onClick → triggers vote mutation              │
└─────────────────────────────────────────────────────────┘
                         │
                    User clicks
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      PENDING                            │
│  ┌─────┐                                                │
│  │  ↑  │  Green background (optimistic)                 │
│  └─────┘  opacity:50% (shows loading)                   │
│            disabled (prevents double-click)             │
└─────────────────────────────────────────────────────────┘
                         │
                  Server responds
                         │
         ┌───────────────┴───────────────┐
         │                               │
    Success                          Error
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌────────────────────┐
│     UPVOTED      │          │     NOT VOTED      │
│  ┌─────┐         │          │  ┌─────┐          │
│  │  ↑  │  Green  │          │  │  ↑  │  Gray    │
│  └─────┘  Active │          │  └─────┘  (rolled │
│            state │          │            back)   │
└──────────────────┘          └────────────────────┘
```

## 🔍 Debugging Flow Chart

```
Vote doesn't work?
│
├─ Is user authenticated?
│  ├─ No → Show login prompt
│  └─ Yes → Continue
│
├─ Does button click trigger handleVote()?
│  ├─ No → Check onClick binding
│  └─ Yes → Continue
│
├─ Is mutation triggered?
│  ├─ No → Check useVoteIdea() setup
│  └─ Yes → Continue
│
├─ Does optimistic update happen?
│  ├─ No → Check onMutate logic
│  └─ Yes → Continue
│
├─ Does API request succeed?
│  ├─ No → Check console for errors
│  │       Check API route logs
│  │       Check authentication
│  └─ Yes → Continue
│
├─ Does cache invalidation happen?
│  ├─ No → Check onSettled hook
│  └─ Yes → Vote working! ✅
│
└─ Check browser console for errors
   Check Network tab for failed requests
   Check server logs for backend errors
```

## 📦 Import Diagram

```
components/feed/IdeaCard.tsx
│
├─ import { useVoteIdea } from "@/hooks/useVoting"
│   │
│   └─ hooks/useVoting.ts
│       ├─ import { useMutation, useQueryClient } from "@tanstack/react-query"
│       └─ async function submitVote()
│           │
│           └─ fetch("/api/ideas/vote", ...)
│               │
│               └─ app/api/ideas/vote/route.ts
│                   ├─ import { prisma } from "@/lib/prisma"
│                   ├─ import { auth } from "@/lib/auth/auth"
│                   └─ Database operations
│
├─ import { Button } from "@/components/ui/button"
├─ import { cn } from "@/lib/utils"
└─ import { useState } from "react"
```

## 🎯 Key Takeaways

1. **Isolation**: Each `IdeaCard` manages its own vote state
2. **Optimism**: UI updates before server confirms (0ms latency)
3. **Safety**: Automatic rollback on errors
4. **Efficiency**: Only affected components re-render
5. **Type Safety**: TypeScript throughout the entire flow

---

**This visual guide complements the main documentation.**  
For detailed implementation, see: `VOTING_SYSTEM.md`
