# Comment System Quick Reference

## 🎯 Usage

```tsx
import CommentSection from "@/components/comment/CommentSection";

// In your page
<CommentSection ideaId={ideaId} />
```

That's it! Everything else is handled automatically.

## 🔌 API Endpoints

| Method | Endpoint | Purpose | Pagination |
|--------|----------|---------|------------|
| GET | `/api/comment/get?ideaId={id}&cursor={cursor}` | List comments | ✅ Cursor |
| GET | `/api/comment/replies?commentId={id}` | Get replies | ✅ Cursor |
| POST | `/api/comment/create` | Create comment | - |
| POST | `/api/comment/vote` | Vote on comment | - |

## 🪝 React Query Hooks

```tsx
import {
  useComments,        // Fetch comments (infinite)
  useReplies,         // Fetch replies (lazy)
  useCreateComment,   // Create mutation
  useVoteComment,     // Vote mutation
} from "@/lib/hooks/use-comment-query";

// Example: Infinite comments
const { data, fetchNextPage, hasNextPage } = useComments(ideaId);

// Example: Create comment
const mutation = useCreateComment(ideaId, parentId);
await mutation.mutateAsync({ content: "Hello!", ideaId });

// Example: Vote
const voteMutation = useVoteComment(ideaId);
voteMutation.mutate({ commentId, voteType: "UP" });
```

## 🧩 Component Props

### CommentSection
```tsx
<CommentSection
  ideaId: string              // Required
  initialComments?: Comment[] // Optional (SSR)
/>
```

### CommentForm
```tsx
<CommentForm
  ideaId: string           // Required
  parentId?: string        // For replies
  onSuccess?: () => void   // Callback
  placeholder?: string     // Custom text
  autoFocus?: boolean      // Auto focus
/>
```

### Comment
```tsx
<Comment
  comment: Comment    // Required
  ideaId: string      // Required
  depth?: number      // Nesting level (0-5)
  maxDepth?: number   // Max depth (5)
/>
```

### VotesButton
```tsx
<VotesButton
  commentId: string           // Required
  ideaId: string              // Required
  initialVotesCount: number   // Required
  initialUserVote?: VoteType  // "UP" | "DOWN" | null
  size?: "sm" | "md" | "lg"   // Button size
/>
```

## 📝 TypeScript Types

```tsx
import type {
  Comment,              // Comment object
  CommentUser,          // User info in comment
  CommentListResponse,  // GET /api/comment/get response
  ReplyListResponse,    // GET /api/comment/replies response
  CreateCommentRequest, // POST /api/comment/create body
  VoteCommentRequest,   // POST /api/comment/vote body
} from "@/types/comment";
```

## 🔑 Query Keys

```tsx
import { commentKeys } from "@/lib/hooks/comment-query-keys";

commentKeys.list(ideaId)        // ['comments', 'list', { ideaId }]
commentKeys.replies(commentId)  // ['comments', 'replies', { commentId }]
```

## 🐛 Common Fixes

### Clear cache
```tsx
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: commentKeys.all });
```

### Refetch comments
```tsx
const { refetch } = useComments(ideaId);
refetch();
```

### Reset form
```tsx
<CommentForm
  key={resetKey} // Change key to reset
  ideaId={ideaId}
/>
```

## ⚡ Performance Tips

1. **Don't fetch all replies at once** - Use lazy loading
2. **Limit nesting depth** - Max 5 levels (already enforced)
3. **Use optimistic updates** - Already built-in
4. **Memoize custom components** - Use `React.memo()`
5. **Batch network calls** - React Query does this automatically

## 🎨 Customization

### Custom placeholder
```tsx
<CommentForm
  ideaId={ideaId}
  placeholder="Share your thoughts..."
/>
```

### Custom vote size
```tsx
<VotesButton
  commentId={comment.id}
  ideaId={ideaId}
  initialVotesCount={comment.votesCount}
  size="lg" // Larger vote buttons
/>
```

### Custom max depth
```tsx
<Comment
  comment={comment}
  ideaId={ideaId}
  maxDepth={3} // Only allow 3 levels
/>
```

## 🔒 Security

- ✅ Session validated server-side
- ✅ Input sanitized (1-2000 chars)
- ✅ SQL injection safe (Prisma)
- ✅ CSRF protection (Next.js)
- ✅ Ownership verified

## 📊 Monitoring

### Check cache size
```tsx
const queryClient = useQueryClient();
console.log(queryClient.getQueryCache().getAll());
```

### Monitor mutations
```tsx
const mutation = useCreateComment(ideaId);
console.log({
  isPending: mutation.isPending,
  isError: mutation.isError,
  isSuccess: mutation.isSuccess,
});
```

## 🧪 Testing

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Wrap in provider
const queryClient = new QueryClient();
render(
  <QueryClientProvider client={queryClient}>
    <CommentSection ideaId="test-id" />
  </QueryClientProvider>
);

// Interact
await userEvent.type(screen.getByPlaceholderText("Write a comment..."), "Test");
await userEvent.click(screen.getByText("Comment"));

// Assert
await waitFor(() => {
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

## 📚 Full Documentation

See [COMMENT_SYSTEM.md](./COMMENT_SYSTEM.md) for complete documentation.

---

**Quick Links:**
- [Migration Guide](./COMMENT_SYSTEM_MIGRATION.md)
- [File Tree](./COMMENT_SYSTEM_FILES.md)
- [Example Tests](../__tests__/comment-system.test.tsx)
