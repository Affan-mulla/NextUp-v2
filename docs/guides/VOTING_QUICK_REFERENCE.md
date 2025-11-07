# Voting System - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install @tanstack/react-query zustand
```

### 2. Use in Component
```tsx
import { useVoteIdea } from "@/hooks/useVoting";

function MyCard({ ideaId, votesCount, userVote }) {
  const { mutate: vote, isPending } = useVoteIdea();
  
  return (
    <button 
      onClick={() => vote({ ideaId, voteType: "UP" })}
      disabled={isPending}
    >
      👍 {votesCount}
    </button>
  );
}
```

## 📋 Common Patterns

### Basic Vote Button
```tsx
const handleVote = (voteType: "UP" | "DOWN") => {
  vote({ ideaId, voteType });
};

<button onClick={() => handleVote("UP")}>Upvote</button>
<button onClick={() => handleVote("DOWN")}>Downvote</button>
```

### With Active State
```tsx
const isUpvoted = userVote?.type === "UP";
const isDownvoted = userVote?.type === "DOWN";

<button 
  className={isUpvoted ? "active" : ""}
  onClick={() => handleVote("UP")}
>
  Upvote
</button>
```

### With Loading State Per Button
```tsx
const [pendingVote, setPendingVote] = useState<VoteType | null>(null);

const handleVote = (voteType: VoteType) => {
  setPendingVote(voteType);
  vote(
    { ideaId, voteType },
    { onSettled: () => setPendingVote(null) }
  );
};

<button 
  disabled={isPending && pendingVote === "UP"}
  onClick={() => handleVote("UP")}
>
  {isPending && pendingVote === "UP" ? "..." : "Upvote"}
</button>
```

### Complete Example
```tsx
import { useVoteIdea, type VoteType } from "@/hooks/useVoting";
import { useState } from "react";
import { cn } from "@/lib/utils";

function VoteButtons({ ideaId, votesCount, userVote }) {
  const [pendingVote, setPendingVote] = useState<VoteType | null>(null);
  const { mutate: vote, isPending } = useVoteIdea();
  
  const handleVote = (voteType: VoteType) => {
    if (isPending) return;
    setPendingVote(voteType);
    vote(
      { ideaId, voteType },
      { onSettled: () => setPendingVote(null) }
    );
  };
  
  const isUpvoted = userVote?.type === "UP";
  const isDownvoted = userVote?.type === "DOWN";
  
  return (
    <div>
      <button
        onClick={() => handleVote("UP")}
        disabled={isPending}
        className={cn(
          "vote-btn",
          isUpvoted && "active-up",
          isPending && pendingVote === "UP" && "loading"
        )}
      >
        👍
      </button>
      
      <span>{votesCount}</span>
      
      <button
        onClick={() => handleVote("DOWN")}
        disabled={isPending}
        className={cn(
          "vote-btn",
          isDownvoted && "active-down",
          isPending && pendingVote === "DOWN" && "loading"
        )}
      >
        👎
      </button>
    </div>
  );
}
```

## 🔑 Key Concepts

### Optimistic Updates
- UI updates **instantly** when user clicks
- Server request happens in background
- If server fails, UI **rolls back** automatically

### Isolated State
- Each post manages its own vote state
- Voting on Post A doesn't affect Post B
- No global re-renders

### Vote Logic
| Current | Click | Result |
|---------|-------|--------|
| None | UP | Upvote (+1) |
| None | DOWN | Downvote (-1) |
| UP | UP | Remove (0) |
| DOWN | DOWN | Remove (0) |
| UP | DOWN | Switch to down (-2) |
| DOWN | UP | Switch to up (+2) |

## 🎨 Styling Active States

### Tailwind CSS
```tsx
className={cn(
  "hover:text-green-500",
  isUpvoted && "text-green-500 bg-green-500/10"
)}
```

### CSS Modules
```css
.vote-btn {
  transition: all 0.2s;
}

.vote-btn.active-up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.vote-btn.active-down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
```

## 🐛 Debugging

### Check Vote Status
```tsx
console.log({
  ideaId,
  votesCount,
  userVote,
  isPending,
  isUpvoted,
  isDownvoted
});
```

### Monitor Mutations
```tsx
const { mutate, isPending, isError, error } = useVoteIdea();

useEffect(() => {
  if (isError) {
    console.error("Vote failed:", error);
  }
}, [isError, error]);
```

### Inspect Cache
```tsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
const ideasCache = queryClient.getQueryData(["ideas"]);
console.log("Cache:", ideasCache);
```

## 📊 Type Definitions

```typescript
// Vote type
type VoteType = "UP" | "DOWN";

// Vote mutation payload
interface VoteMutationData {
  ideaId: string;
  voteType: VoteType;
}

// Server response
interface VoteResponse {
  success: boolean;
  votesCount: number;
  userVote: {
    type: VoteType;
  } | null;
}

// Idea with vote data
interface IdeaVoteData {
  id: string;
  votesCount: number;
  userVote?: {
    type: VoteType;
  } | null;
}
```

## ⚡ Performance Tips

### 1. Prevent Multiple Clicks
```tsx
const handleVote = (voteType: VoteType) => {
  if (isPending) return; // Guard clause
  vote({ ideaId, voteType });
};
```

### 2. Debounce (If Needed)
```tsx
import { useMemo } from "react";
import debounce from "lodash/debounce";

const debouncedVote = useMemo(
  () => debounce((data) => vote(data), 300),
  [vote]
);
```

### 3. Cache Optimization
Already handled by React Query:
- Stale time: 5 minutes
- Cache time: 30 minutes
- Background refetch on window focus: disabled

## 🔐 Security Notes

- ✅ **Authentication**: Votes require valid session
- ✅ **Validation**: Server validates all input
- ✅ **Authorization**: Users can only vote as themselves
- ✅ **Rate Limiting**: Consider adding rate limits
- ✅ **CSRF Protection**: Next.js handles this

## 🚨 Common Issues

### Issue: Vote count doesn't update
**Solution**: Check if `userVote` prop is passed to component

### Issue: Multiple votes at once
**Solution**: Add `if (isPending) return;` guard

### Issue: Vote doesn't persist
**Solution**: Verify database constraints and API authentication

### Issue: UI doesn't revert on error
**Solution**: Check onError rollback logic in hook

## 📞 Need Help?

- **Documentation**: `/docs/guides/VOTING_SYSTEM.md`
- **Hook**: `/hooks/useVoting.ts`
- **API**: `/app/api/ideas/vote/route.ts`
- **Component**: `/components/feed/IdeaCard.tsx`

## ✅ Checklist for New Vote Features

- [ ] Import `useVoteIdea` hook
- [ ] Add `isPending` loading state
- [ ] Handle both UP and DOWN votes
- [ ] Show active state for current vote
- [ ] Disable buttons during mutation
- [ ] Pass `userVote` prop from parent
- [ ] Test optimistic update
- [ ] Test rollback on error
- [ ] Add accessibility (aria-labels)
- [ ] Style active states

---

**Quick Links**:
- [Full Documentation](./VOTING_SYSTEM.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Prisma Docs](https://www.prisma.io/docs)
