# Voting System Refactor - Production Ready

## 🎯 Overview

Refactored the entire voting system to **fix UI rollback issues** and **optimize performance**. The system now uses best practices for optimistic updates with TanStack Query and handles edge cases properly.

---

## ⚠️ Problems Fixed

### 1. **UI Rollback Issue** ❌ → ✅
**Problem:**
- When switching votes (UP → DOWN or DOWN → UP), the UI would sometimes revert to the previous state
- Database updated correctly, but cache would show stale data
- Issue caused by using `setQueryData` (singular) which only updates one query instance

**Root Cause:**
- Infinite scroll creates multiple query cache instances with different cursors
- `setQueryData(["ideas"], ...)` only updates ONE instance
- When other instances refetch, they overwrite the optimistic update with stale data

**Solution:**
- Use `setQueriesData(["ideas"], ...)` (plural) to update ALL query instances
- Use `getQueriesData(["ideas"])` to snapshot ALL instances for rollback
- Write server-confirmed data to cache in `onSuccess` (don't rely solely on invalidation)

---

### 2. **Partial Cache Updates** ❌ → ✅
**Problem:**
- Some pages/queries would show updated vote, others would show old data
- Inconsistent UI across different parts of the feed

**Solution:**
- `setQueriesData` updates every query matching `["ideas"]`
- All pages in infinite scroll get updated simultaneously
- Atomic rollback restores ALL queries if mutation fails

---

### 3. **Global isPending State** ❌ → ✅
**Problem:**
- Using global `isPending` from mutation disables ALL vote buttons in the feed
- Clicking vote on one post disables buttons on unrelated posts
- Poor UX and unnecessary re-renders

**Solution:**
- Per-idea pending state using `useIsVotingIdea(ideaId)` hook
- Checks mutation cache for pending mutations on specific idea
- Only disables the voted idea's buttons, not all posts

---

### 4. **Missing Mutation Key** ❌ → ✅
**Problem:**
- No mutation key made it impossible to track specific vote mutations
- Couldn't implement per-idea pending detection

**Solution:**
- Added `mutationKey: ["vote-idea"]` to mutation
- Enables querying mutation cache by key for pending state

---

### 5. **Server Data Reconciliation** ❌ → ✅
**Problem:**
- Relied solely on `invalidateQueries` for server sync
- Invalidation is async and can cause race conditions
- UI might revert before fresh data arrives

**Solution:**
- Write server data directly to cache in `onSuccess`
- Ensures cache matches server state immediately
- Background invalidation provides eventual consistency

---

## 🔧 Technical Implementation

### **1. useVoteIdea Hook (hooks/useVoting.ts)**

#### Key Changes:

```typescript
// ❌ OLD: Single query update
queryClient.setQueryData(["ideas"], (old) => { ... });

// ✅ NEW: Multi-query update
queryClient.setQueriesData({ queryKey: ["ideas"] }, (old) => { ... });
```

#### onMutate (Optimistic Update):
```typescript
onMutate: async ({ ideaId, voteType }) => {
  // 1. Cancel outgoing queries (prevent race conditions)
  await queryClient.cancelQueries({ queryKey: ["ideas"] });

  // 2. Snapshot ALL queries for rollback
  const previousQueries = queryClient.getQueriesData({ 
    queryKey: ["ideas"] 
  });

  // 3. Update ALL queries optimistically
  queryClient.setQueriesData({ queryKey: ["ideas"] }, (old) => {
    // Update only the specific idea
    // Preserve all other ideas unchanged
  });

  // 4. Return snapshot for rollback
  return { previousQueries };
}
```

#### onSuccess (Server Reconciliation):
```typescript
onSuccess: (serverData, { ideaId }) => {
  // Write server-confirmed data to ALL queries
  // Prevents stale data from causing rollback
  queryClient.setQueriesData({ queryKey: ["ideas"] }, (old) => {
    // Update with server data
  });
}
```

#### onError (Atomic Rollback):
```typescript
onError: (_error, _variables, context) => {
  // Restore ALL queries from snapshot
  if (context?.previousQueries) {
    context.previousQueries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}
```

---

### **2. useIsVotingIdea Hook (Per-Idea Pending State)**

```typescript
export function useIsVotingIdea(ideaId: string): boolean {
  const queryClient = useQueryClient();

  // Find all pending vote mutations
  const mutations = queryClient.getMutationCache().findAll({
    mutationKey: ["vote-idea"],
    predicate: (mutation) => mutation.state.status === "pending",
  });

  // Check if any mutation is for THIS specific idea
  return mutations.some((mutation) => {
    const variables = mutation.state.variables as VoteMutationData;
    return variables?.ideaId === ideaId;
  });
}
```

**Benefits:**
- Returns `true` only when THIS specific idea is being voted on
- Other ideas' buttons remain enabled
- No unnecessary re-renders across posts

---

### **3. IdeaCard Component (components/feed/IdeaCard.tsx)**

#### Key Changes:

```typescript
// ❌ OLD: Global pending state + local state tracking
const [pendingVote, setPendingVote] = useState<VoteType | null>(null);
const { mutate: vote, isPending } = useVoteIdea();

// ✅ NEW: Per-idea pending state (no local state needed)
const { mutate: vote } = useVoteIdea();
const isVoting = useIsVotingIdea(id);
```

#### Simplified Vote Handler:
```typescript
// ❌ OLD: Complex state management
const handleVote = (voteType: VoteType) => {
  if (isPending) return;
  setPendingVote(voteType);
  vote({ ideaId: id, voteType }, {
    onSettled: () => setPendingVote(null)
  });
};

// ✅ NEW: Clean and simple
const handleVote = (voteType: VoteType) => {
  if (isVoting) return;
  vote({ ideaId: id, voteType });
};
```

#### Button State:
```typescript
// ❌ OLD: Track which specific button is loading
disabled={isPending}
className={cn(
  "...",
  isPending && pendingVote === "UP" && "opacity-50"
)}

// ✅ NEW: Disable both buttons while voting
disabled={isVoting}
className={cn(
  "...",
  isVoting && "opacity-50 cursor-not-allowed"
)}
```

---

### **4. API Route (app/api/ideas/vote/route.ts)**

#### Key Changes:

**Removed:**
- ❌ All verbose logging (cleaned up for production)
- ❌ RequestId tracking
- ❌ Timestamp logging

**Kept:**
- ✅ Three-state vote logic (create, remove, switch)
- ✅ Atomic database updates
- ✅ Proper error handling
- ✅ **CRITICAL:** Response format matches cache structure exactly

#### Response Format (Must Match Cache):
```typescript
return NextResponse.json({
  success: true,
  votesCount: updatedIdea.votesCount,  // number
  userVote: finalUserVote,             // { type: "UP" | "DOWN" } | null
});
```

This ensures server data can be written directly to cache in `onSuccess` without transformation.

---

## 📊 Performance Improvements

### Before:
- ❌ All vote buttons disabled when any post is voted on
- ❌ Full feed re-renders on every vote
- ❌ Partial cache updates cause UI inconsistencies
- ❌ Race conditions between invalidation and optimistic updates

### After:
- ✅ Only voted post's buttons disabled
- ✅ Only voted post re-renders
- ✅ All query instances updated atomically
- ✅ Server data written directly to cache (no race conditions)
- ✅ Background revalidation ensures eventual consistency

---

## 🎨 User Experience Improvements

### Instant Feedback:
- UI updates **immediately** when vote button is clicked
- No waiting for server response
- Feels native and responsive

### Consistent State:
- All pages in infinite scroll show same vote state
- No flickering or rollback
- Vote count always accurate

### Per-Post Loading:
- Only the voted post shows loading state
- Other posts remain fully interactive
- Better multi-tasking experience

---

## 🔍 Vote State Machine (3 States)

The system handles three vote scenarios:

### **State 1: Create Vote** (No previous vote)
```
Action: Click UP
Before: votesCount: 42, userVote: null
After:  votesCount: 43, userVote: { type: "UP" }
Delta:  +1
```

### **State 2: Remove Vote** (Click same button)
```
Action: Click UP (already upvoted)
Before: votesCount: 43, userVote: { type: "UP" }
After:  votesCount: 42, userVote: null
Delta:  -1
```

### **State 3: Switch Vote** (Click opposite button)
```
Action: Click DOWN (currently upvoted)
Before: votesCount: 43, userVote: { type: "UP" }
After:  votesCount: 41, userVote: { type: "DOWN" }
Delta:  -2 (remove +1, add -1)
```

---

## ✅ Production Checklist

- [x] Fix UI rollback issue with setQueriesData
- [x] Per-idea pending state (no interference between posts)
- [x] Atomic rollback on error
- [x] Server data written to cache in onSuccess
- [x] Background revalidation with invalidateQueries
- [x] Clean code with helpful comments
- [x] TypeScript best practices
- [x] No console logs in production
- [x] Proper error handling
- [x] Response format matches cache structure

---

## 🚀 Testing Guide

### Test Scenarios:

1. **Basic Vote:**
   - Click upvote → Should increment immediately
   - Click downvote → Should decrement immediately
   - Click same button → Should toggle off

2. **Vote Switch:**
   - Upvote → Click downvote → Count should drop by 2
   - Downvote → Click upvote → Count should increase by 2

3. **Multiple Posts:**
   - Vote on one post → Other posts' buttons should stay enabled
   - Vote on multiple posts quickly → Each should work independently

4. **Network Failure:**
   - Disconnect internet → Vote → Should rollback when request fails
   - All pages should show correct state after rollback

5. **Infinite Scroll:**
   - Load multiple pages → Vote on post from page 1
   - Check pages 2, 3 → Vote should persist across all pages

6. **Concurrent Votes:**
   - Rapidly click vote buttons → Should handle gracefully
   - Only one vote should be pending at a time per post

---

## 📝 Code Quality

### TypeScript:
- Full type safety throughout
- Proper interface definitions
- No `any` types

### Comments:
- Clear inline comments explaining complex logic
- Documented vote state machine
- Explained cache update strategy

### Architecture:
- Clean separation of concerns
- Reusable hooks
- Minimal, focused components

---

## 🎯 Key Takeaways

1. **Always use setQueriesData** for infinite scroll queries
2. **Write server data to cache** in onSuccess (don't rely on invalidation alone)
3. **Per-resource pending state** is better than global state
4. **Atomic rollback** requires snapshots of ALL queries
5. **Response format must match cache structure** exactly

---

## 🔗 Related Files

- `hooks/useVoting.ts` - Vote mutation logic
- `components/feed/IdeaCard.tsx` - Vote UI component
- `app/api/ideas/vote/route.ts` - API endpoint
- `hooks/useIdeas.ts` - Ideas query (unchanged)

---

**Status:** ✅ Production Ready  
**Performance:** Optimized  
**UI/UX:** Smooth, no rollback issues  
**Code Quality:** Clean, well-documented
