# VoteType Values - Important Note

## ⚠️ Using Existing Database Schema

The comment system uses the **existing** VoteType enum from your Prisma schema:

```prisma
enum VoteType {
  UP      // Upvote
  DOWN    // Downvote
}
```

**No database migration required!** The system works with your current schema.

## 📝 Usage in Code

When working with votes, use these string values:

```typescript
// Upvote
voteType: "UP"

// Downvote  
voteType: "DOWN"

// Remove vote
voteType: null
```

## 🔧 Examples

### API Request
```typescript
await axios.post("/api/comment/vote", {
  commentId: "comment-123",
  voteType: "UP"  // or "DOWN" or null
});
```

### React Component
```tsx
<VotesButton
  commentId={comment.id}
  ideaId={ideaId}
  initialVotesCount={comment.votesCount}
  initialUserVote="UP"  // or "DOWN" or null
/>
```

### React Query Mutation
```typescript
const voteMutation = useVoteComment(ideaId);

// Upvote
voteMutation.mutate({ commentId, voteType: "UP" });

// Downvote
voteMutation.mutate({ commentId, voteType: "DOWN" });

// Remove vote
voteMutation.mutate({ commentId, voteType: null });
```

## ✅ Setup

Just regenerate your Prisma client:

```bash
npx prisma generate
```

That's it! No schema changes, no migrations needed.
