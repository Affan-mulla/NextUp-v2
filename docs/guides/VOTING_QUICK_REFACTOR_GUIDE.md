# Voting System - Quick Reference

## 🎯 What Changed

### The Fix
**Problem:** UI rollback when voting (especially when switching votes)  
**Solution:** Use `setQueriesData` (plural) to update ALL query instances

---

## 📚 Core Concepts

### 1. Multi-Query Updates
```typescript
// ❌ WRONG: Only updates one query instance
queryClient.setQueryData(["ideas"], updater);

// ✅ CORRECT: Updates ALL query instances
queryClient.setQueriesData({ queryKey: ["ideas"] }, updater);
```

**Why?** Infinite scroll creates multiple query caches. Must update all.

---

### 2. Per-Idea Pending State
```typescript
// ❌ WRONG: Disables ALL posts
const { isPending } = useVoteIdea();

// ✅ CORRECT: Only disables THIS post
const isVoting = useIsVotingIdea(ideaId);
```

**Why?** Better UX - other posts stay interactive.

---

### 3. Server Data Reconciliation
```typescript
onSuccess: (serverData, { ideaId }) => {
  // Write server data to cache immediately
  queryClient.setQueriesData({ queryKey: ["ideas"] }, (old) => {
    // Update with serverData
  });
}
```

**Why?** Prevents stale data from causing rollback.

---

## 🔄 Vote Flow

```
User clicks vote button
     ↓
onMutate: Optimistic update (instant UI change)
     ↓
mutationFn: Send request to server
     ↓
✅ onSuccess: Write server data to cache
     OR
❌ onError: Rollback ALL queries
     ↓
onSettled: Invalidate queries (background refetch)
```

---

## 🎨 Component Usage

```tsx
import { useVoteIdea, useIsVotingIdea } from "@/hooks/useVoting";

function IdeaCard({ id, votesCount, userVote }) {
  const { mutate: vote } = useVoteIdea();
  const isVoting = useIsVotingIdea(id); // Per-idea pending state

  const handleVote = (voteType: "UP" | "DOWN") => {
    if (isVoting) return; // Prevent double-click
    vote({ ideaId: id, voteType });
  };

  return (
    <Button 
      onClick={() => handleVote("UP")}
      disabled={isVoting} // Only THIS post's button disabled
    >
      Upvote ({votesCount})
    </Button>
  );
}
```

---

## 🗳️ Vote Logic (3 States)

| Current State | Action | Result | Delta |
|---------------|--------|--------|-------|
| No vote | Click UP | Create upvote | +1 |
| No vote | Click DOWN | Create downvote | -1 |
| Upvoted | Click UP | Remove vote | -1 |
| Upvoted | Click DOWN | Switch to down | -2 |
| Downvoted | Click DOWN | Remove vote | +1 |
| Downvoted | Click UP | Switch to up | +2 |

---

## 🔧 Helper Function

```typescript
// Calculate vote update (used in optimistic update)
function calculateVoteUpdate(
  currentVotesCount: number,
  currentUserVote: { type: VoteType } | null,
  newVoteType: VoteType
): { votesCount: number; userVote: { type: VoteType } | null }
```

**Benefits:**
- Reusable logic
- Consistent calculations
- Easier to test

---

## 📦 API Response Format

**CRITICAL:** Must match cache structure exactly

```typescript
{
  success: true,
  votesCount: number,           // Updated total
  userVote: {                   // User's current vote
    type: "UP" | "DOWN"
  } | null
}
```

---

## ⚠️ Common Pitfalls

### 1. Using setQueryData instead of setQueriesData
```typescript
// ❌ WRONG: Infinite scroll breaks
queryClient.setQueryData(["ideas"], updater);

// ✅ CORRECT
queryClient.setQueriesData({ queryKey: ["ideas"] }, updater);
```

### 2. Only snapshotting one query
```typescript
// ❌ WRONG: Partial rollback
const previous = queryClient.getQueryData(["ideas"]);

// ✅ CORRECT: Snapshot ALL queries
const previous = queryClient.getQueriesData({ queryKey: ["ideas"] });
```

### 3. Not writing server data in onSuccess
```typescript
// ❌ WRONG: Relies on invalidation (race conditions)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["ideas"] });
}

// ✅ CORRECT: Write data immediately
onSuccess: (serverData, { ideaId }) => {
  queryClient.setQueriesData({ queryKey: ["ideas"] }, (old) => {
    // Update with serverData
  });
  // THEN invalidate for background refetch
  queryClient.invalidateQueries({ queryKey: ["ideas"] });
}
```

### 4. Using global isPending
```typescript
// ❌ WRONG: Disables all posts
const { mutate, isPending } = useVoteIdea();
<Button disabled={isPending}>Vote</Button>

// ✅ CORRECT: Per-idea pending
const { mutate } = useVoteIdea();
const isVoting = useIsVotingIdea(ideaId);
<Button disabled={isVoting}>Vote</Button>
```

---

## 🎯 Best Practices

1. **Always use mutation keys** for tracking
2. **Update ALL queries** in optimistic updates
3. **Write server data** in onSuccess
4. **Atomic rollback** - restore ALL queries on error
5. **Per-resource pending** - don't use global state
6. **Match response format** to cache structure

---

## 🧪 Testing Checklist

- [ ] Vote creates/removes correctly
- [ ] Vote switches work (UP ↔ DOWN)
- [ ] Count updates instantly
- [ ] Only voted post's buttons disabled
- [ ] Other posts remain interactive
- [ ] Network failure triggers rollback
- [ ] All pages show same vote state
- [ ] Rapid clicking handled gracefully

---

## 📖 Full Documentation

See `VOTING_REFACTOR_SUMMARY.md` for complete details.

---

**Status:** ✅ Production Ready
