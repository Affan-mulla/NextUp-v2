# Voting System Documentation

## 🎯 Overview

A highly optimized voting system for NextUp built with Next.js App Router, Prisma, TanStack Query, and Zustand. Features instant UI feedback with proper optimistic updates and isolated state management per post.

## 🏗️ Architecture

### Technology Stack

- **Frontend State**: TanStack Query v5 (React Query)
- **Backend**: Next.js API Routes + Prisma ORM
- **Session Management**: Zustand (user/session data only)
- **Database**: PostgreSQL via Prisma
- **Authentication**: Better Auth

### Key Design Principles

1. **Isolated State**: Each post manages its own vote state independently
2. **Optimistic Updates**: UI responds instantly before server confirmation
3. **Graceful Rollback**: Failed requests revert UI to previous state
4. **Minimal Re-renders**: Only affected post updates, no global re-renders
5. **Type Safety**: Full TypeScript throughout the stack

## 📁 File Structure

```
├── hooks/
│   └── useVoting.ts           # React Query voting hooks
├── app/api/ideas/vote/
│   └── route.ts               # POST endpoint for voting
├── components/feed/
│   ├── IdeaCard.tsx          # Individual post card with voting UI
│   └── IdeaWrapper.tsx       # Feed wrapper (passes vote data)
└── prisma/schema.prisma      # Database schema (Votes model)
```

## 🔄 Data Flow

### 1. User Clicks Vote Button

```
User clicks → handleVote() → vote mutation triggered
```

### 2. Optimistic Update (Instant UI)

```
onMutate hook runs → Cache snapshot created → UI updates immediately
```

### 3. Server Request

```
API receives request → Validates auth → Updates database → Returns response
```

### 4. Success/Error Handling

```
Success: onSuccess → UI already correct
Error: onError → Rollback to snapshot → Show error
Finally: onSettled → Refetch for consistency
```

## 🎨 Component Architecture

### IdeaCard (Isolated Voting State)

Each `IdeaCard` component:
- Manages its own `pendingVote` state
- Uses `useVoteIdea()` hook for mutations
- Shows active state for current user vote
- Disables buttons during mutation

**Key Features:**
- ✅ No prop drilling of vote handlers
- ✅ No global state pollution
- ✅ Per-card loading states
- ✅ Visual feedback (active colors, opacity)

### IdeaWrapper (Data Provider)

Responsibilities:
- Fetch ideas via `useIdeas()` hook
- Pass `userVote` prop to cards
- Handle infinite scroll
- Display loading/error states

**Does NOT:**
- ❌ Manage voting logic
- ❌ Handle vote mutations
- ❌ Track which card is voting

## 🔧 API Implementation

### Endpoint: POST /api/ideas/vote

**Request:**
```typescript
{
  ideaId: string;      // ID of the idea
  voteType: "UP" | "DOWN";  // Vote type
}
```

**Response:**
```typescript
{
  success: boolean;
  votesCount: number;  // Updated total
  userVote: { type: "UP" | "DOWN" } | null;
}
```

### Vote State Machine

The API implements a 3-state machine:

#### State 1: No Existing Vote
```
Action: Create new vote
Database: INSERT into Votes
Delta: +1 (UP) or -1 (DOWN)
Result: userVote = { type: voteType }
```

#### State 2: Same Vote (Toggle Off)
```
Action: Remove vote
Database: DELETE from Votes
Delta: -1 (was UP) or +1 (was DOWN)
Result: userVote = null
```

#### State 3: Opposite Vote (Switch)
```
Action: Switch vote
Database: UPDATE Votes SET type
Delta: +2 (DOWN→UP) or -2 (UP→DOWN)
Result: userVote = { type: voteType }
```

### Atomic Updates

Uses Prisma's `increment` to prevent race conditions:

```typescript
await prisma.ideas.update({
  where: { id: ideaId },
  data: {
    votesCount: {
      increment: voteDelta  // Atomic operation
    }
  }
});
```

## ⚡ Optimistic Updates

### How It Works

1. **Snapshot Creation**
   ```typescript
   const previousData = queryClient.getQueryData(["ideas"]);
   ```

2. **Instant UI Update**
   ```typescript
   queryClient.setQueryData(["ideas"], (old) => {
     // Update only the affected idea
     return updatedData;
   });
   ```

3. **Rollback on Error**
   ```typescript
   onError: (err, vars, context) => {
     queryClient.setQueryData(["ideas"], context.previousData);
   }
   ```

### Vote Calculation Logic

```typescript
if (currentVote === voteType) {
  // Toggle off: Remove vote
  newVotesCount += voteType === "UP" ? -1 : 1;
  newUserVote = null;
} else if (currentVote) {
  // Switch: UP ↔ DOWN
  newVotesCount += voteType === "UP" ? 2 : -2;
  newUserVote = { type: voteType };
} else {
  // New vote
  newVotesCount += voteType === "UP" ? 1 : -1;
  newUserVote = { type: voteType };
}
```

## 🎯 Usage Examples

### Basic Voting

```typescript
import { useVoteIdea } from "@/hooks/useVoting";

function MyComponent() {
  const { mutate: vote, isPending } = useVoteIdea();
  
  const handleUpvote = () => {
    vote({ ideaId: "123", voteType: "UP" });
  };
  
  return (
    <button onClick={handleUpvote} disabled={isPending}>
      Upvote
    </button>
  );
}
```

### With Loading State

```typescript
const [pendingVote, setPendingVote] = useState<VoteType | null>(null);

const handleVote = (voteType: VoteType) => {
  setPendingVote(voteType);
  
  vote(
    { ideaId, voteType },
    {
      onSettled: () => setPendingVote(null)
    }
  );
};

<Button 
  disabled={isPending && pendingVote === "UP"}
  onClick={() => handleVote("UP")}
>
  Upvote
</Button>
```

### With Active State

```typescript
const isUpvoted = userVote?.type === "UP";

<Button
  className={cn(
    "hover:text-green-500",
    isUpvoted && "text-green-500 bg-green-500/10"
  )}
  onClick={() => handleVote("UP")}
>
  <ArrowBigUpDash />
</Button>
```

## 🔐 Security & Validation

### Authentication
- ✅ Requires Better Auth session
- ✅ Returns 401 if not authenticated
- ✅ UserId extracted from session (not client)

### Input Validation
- ✅ Type checking for ideaId (string)
- ✅ Vote type validation ("UP" | "DOWN" only)
- ✅ Idea existence check
- ✅ Returns 400 for invalid input

### Database Constraints
- ✅ Composite unique key: `userId_ideaId`
- ✅ Prevents duplicate votes
- ✅ Foreign key constraints

## 📊 Performance Optimizations

### 1. Optimistic Updates
- **Benefit**: Instant UI feedback (0ms perceived latency)
- **Trade-off**: Requires rollback logic

### 2. Isolated State
- **Benefit**: Only affected post re-renders
- **Measurement**: 1 component update vs. N components

### 3. Cache Management
- **Strategy**: Invalidate on mutation settle
- **Benefit**: Fresh data without manual refetches

### 4. Atomic Database Operations
- **Method**: Prisma `increment`
- **Benefit**: Prevents race conditions

### 5. Minimal Prop Drilling
- **Pattern**: Each card uses hook directly
- **Benefit**: Clean component tree

## 🧪 Testing Strategy

### Unit Tests

**Hooks:**
```typescript
// Test optimistic update logic
test("useVoteIdea updates cache optimistically", async () => {
  // Mock queryClient
  // Trigger vote mutation
  // Assert cache updated before server response
});
```

**API Route:**
```typescript
// Test vote state machine
test("creates new vote when none exists", async () => {
  // Mock authenticated request
  // Assert vote created
  // Assert count incremented
});
```

### Integration Tests

**User Flow:**
```typescript
test("user can upvote, then remove upvote", async () => {
  // 1. Click upvote
  // 2. Assert UI shows upvoted state
  // 3. Click upvote again
  // 4. Assert vote removed
});
```

## 🐛 Error Handling

### Client-Side Errors

```typescript
onError: (error, variables, context) => {
  // 1. Rollback optimistic update
  queryClient.setQueryData(["ideas"], context.previousData);
  
  // 2. Log error
  console.error("Vote failed:", error);
  
  // 3. Show user notification (optional)
  toast.error("Failed to vote. Please try again.");
}
```

### Server-Side Errors

```typescript
// 401 Unauthorized
if (!session?.user?.id) {
  return NextResponse.json(
    { error: "Please sign in to vote" },
    { status: 401 }
  );
}

// 400 Bad Request
if (!VALID_VOTE_TYPES.includes(voteType)) {
  return NextResponse.json(
    { error: 'voteType must be "UP" or "DOWN"' },
    { status: 400 }
  );
}

// 404 Not Found
if (!ideaExists) {
  return NextResponse.json(
    { error: "Idea not found" },
    { status: 404 }
  );
}
```

## 🔄 State Synchronization

### Cache Invalidation Strategy

```typescript
onSettled: () => {
  // Invalidate ideas query after every vote
  // Background refetch ensures consistency
  queryClient.invalidateQueries({ queryKey: ["ideas"] });
}
```

### Preventing Race Conditions

```typescript
onMutate: async ({ ideaId, voteType }) => {
  // Cancel any in-flight queries
  // Prevents old data overwriting optimistic update
  await queryClient.cancelQueries({ queryKey: ["ideas"] });
  
  // ... perform optimistic update
}
```

## 📝 Database Schema

```prisma
model Votes {
  id        String   @id @default(cuid())
  userId    String
  ideaId    String
  postId    String?
  type      VoteType
  createdAt DateTime @default(now())
  
  idea      Ideas    @relation(fields: [ideaId], references: [id])
  post      Post?    @relation(fields: [postId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, ideaId])  // Composite unique constraint
}

enum VoteType {
  UP
  DOWN
}

model Ideas {
  id         String   @id @default(cuid())
  title      String
  votesCount Int      @default(0)  // Denormalized for performance
  // ... other fields
  votes      Votes[]
}
```

## 🚀 Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set (`DATABASE_URL`)
- [ ] Better Auth configured
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Rate limiting configured
- [ ] Database indexes optimized

## 🎓 Learning Resources

### Optimistic Updates
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

### Atomic Operations
- [Prisma: Atomic Operations](https://www.prisma.io/docs/concepts/components/prisma-client/atomic-operations)

### React Query Best Practices
- [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)

## 🤝 Contributing

When adding features to the voting system:

1. Maintain optimistic update pattern
2. Add comprehensive TypeScript types
3. Include error handling
4. Update documentation
5. Add tests for new logic

## 📊 Monitoring

### Key Metrics to Track

- **Vote Success Rate**: % of votes that succeed
- **Average Latency**: Time from click to server response
- **Rollback Rate**: % of optimistic updates that fail
- **Concurrent Vote Conflicts**: Race condition occurrences

### Logging

```typescript
// In API route
console.log({
  action: "vote",
  userId,
  ideaId,
  voteType,
  previousVote: existingVote?.type,
  delta: voteDelta,
  timestamp: new Date().toISOString()
});
```

## ✅ Best Practices

### DO ✅
- Use optimistic updates for instant feedback
- Validate input on both client and server
- Implement proper error handling with rollback
- Use TypeScript for type safety
- Keep vote state isolated per post
- Leverage React Query's cache management

### DON'T ❌
- Don't store votes in Zustand (use React Query)
- Don't update all posts when one is voted on
- Don't skip authentication checks
- Don't ignore error states
- Don't mutate cache directly without snapshots
- Don't skip cache invalidation

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-07  
**Maintained By**: NextUp Team
