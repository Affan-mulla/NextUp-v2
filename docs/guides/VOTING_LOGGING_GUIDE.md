# Voting System - Logging & Debugging Guide

## 🔍 Overview

Comprehensive logging has been added to every component and function in the voting system. Every action, state change, API call, and database operation is logged with emoji prefixes for easy visual identification.

## 📊 Log Categories & Prefixes

### Frontend Logs (Browser Console)

#### 🎨 Component Rendering
- **`[IDEA_CARD]`** - Individual idea card component
- **`[IDEA_WRAPPER]`** - Feed wrapper component
- **`[VOTE_MUTATION]`** - React Query mutation lifecycle

#### 🔵 API Calls
- **`[VOTE_API_CALL]`** - Vote submission to API

### Backend Logs (Server Console)

#### 🟢 API Routes
- **`[API_VOTE]`** - Vote API endpoint processing

## 🎯 Emoji Legend

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 🟢 | Success/Start | Request received, operation started |
| 🔵 | Info | General information |
| 🟡 | Warning/In Progress | Operation in progress |
| 🔴 | Error | Operation failed |
| ✅ | Completed Successfully | Operation completed |
| ❌ | Failed | Operation failed with error |
| ⚠️ | Warning | Non-critical issue |
| 🔐 | Authentication | Auth-related operations |
| 📋 | Validation | Input validation |
| 🔍 | Search/Lookup | Database queries |
| 🗳️ | Vote Operation | Vote-specific actions |
| 📊 | Data/Statistics | Data operations |
| 🎯 | Target/Focus | Specific item targeted |
| 🔄 | State Change | State transitions |
| 🔀 | Switch/Toggle | Vote switch operations |
| ➕ | Add/Create | New vote created |
| 🖱️ | User Interaction | Button clicks |
| ⏳ | Pending | Waiting state |
| 🚀 | Launch/Execute | Starting execution |
| 🏁 | Finished | Completed |
| 🔓 | Unlock/Clear | State cleared |
| 📸 | Snapshot | Cache snapshot |
| ⚡ | Optimistic Update | Cache update |
| ✨ | Result | Final result |
| ⏮️ | Rollback | Reverting changes |
| 📤 | Request | Outgoing request |
| 📥 | Response | Incoming response |
| 🎉 | Success | Major success |
| 💥 | Crash/Error | Unexpected error |
| 👁️ | Observer | Intersection observer |
| ⬇️ | Load More | Pagination |
| 📦 | Component | Component lifecycle |
| 📋 | List/Data | Data display |
| 📭 | Empty | No data |

## 📝 Log Flow for Upvoting

### Complete Log Sequence (Success Case)

```javascript
// 1. USER CLICKS UPVOTE BUTTON
🖱️ [IDEA_CARD] Vote button clicked {
  ideaId: "idea-123",
  voteType: "UP",
  isPending: false,
  currentVote: "none"
}

⏳ [IDEA_CARD] Setting pending vote state {
  ideaId: "idea-123",
  pendingVote: "UP"
}

🚀 [IDEA_CARD] Executing vote mutation {
  ideaId: "idea-123",
  voteType: "UP"
}

// 2. OPTIMISTIC UPDATE STARTS
🟡 [VOTE_MUTATION] onMutate started {
  ideaId: "idea-123",
  voteType: "UP"
}

🚫 [VOTE_MUTATION] Cancelling outgoing queries

📸 [VOTE_MUTATION] Cache snapshot created {
  ideaId: "idea-123",
  pagesCount: 1,
  totalIdeas: 5
}

⚡ [VOTE_MUTATION] Starting optimistic cache update

🎯 [VOTE_MUTATION] Found target idea {
  ideaId: "idea-123",
  currentVotesCount: 10,
  currentVote: "none",
  newVoteType: "UP"
}

➕ [VOTE_MUTATION] Case 3: Adding new vote {
  ideaId: "idea-123",
  voteType: "UP",
  delta: 1,
  oldCount: 10,
  newCount: 11
}

✨ [VOTE_MUTATION] Optimistic update applied {
  ideaId: "idea-123",
  before: { votesCount: 10, userVote: null },
  after: { votesCount: 11, userVote: { type: "UP" } }
}

✅ [VOTE_MUTATION] onMutate completed successfully

// 3. API CALL TO SERVER
🔵 [VOTE_API_CALL] Starting vote submission {
  ideaId: "idea-123",
  voteType: "UP"
}

📤 [VOTE_API_CALL] Request payload: {
  ideaId: "idea-123",
  voteType: "UP"
}

// 4. SERVER PROCESSING
🟢 [API_VOTE] Request received {
  requestId: "vote-1699123456789-abc123",
  method: "POST"
}

🔐 [API_VOTE] Checking authentication

👤 [API_VOTE] Session check result {
  hasSession: true,
  hasUser: true,
  userId: "user-456"
}

✅ [API_VOTE] Authentication successful

📋 [API_VOTE] Parsing request body

📝 [API_VOTE] Request payload {
  ideaId: "idea-123",
  voteType: "UP",
  userId: "user-456"
}

✅ [API_VOTE] Validation passed

🔍 [API_VOTE] Checking if idea exists

✅ [API_VOTE] Idea exists

🗳️ [API_VOTE] Checking for existing vote

🔎 [API_VOTE] Existing vote check result {
  hasExistingVote: false,
  existingVoteType: null,
  newVoteType: "UP"
}

➕ [API_VOTE] State 1: Creating new vote

✅ [API_VOTE] Vote created successfully {
  voteDelta: 1,
  finalUserVote: { type: "UP" }
}

📊 [API_VOTE] Updating idea vote count {
  ideaId: "idea-123",
  voteDelta: 1
}

✅ [API_VOTE] Vote count updated successfully {
  ideaId: "idea-123",
  newVotesCount: 11,
  voteDelta: 1
}

🎉 [API_VOTE] Request completed successfully {
  response: {
    success: true,
    votesCount: 11,
    userVote: { type: "UP" }
  },
  duration: "45ms"
}

// 5. RESPONSE RECEIVED
📥 [VOTE_API_CALL] Response received {
  status: 200,
  statusText: "OK",
  ok: true
}

✅ [VOTE_API_CALL] Success response {
  ideaId: "idea-123",
  voteType: "UP",
  votesCount: 11,
  userVote: { type: "UP" }
}

// 6. MUTATION SUCCESS
✅ [VOTE_MUTATION] onSuccess - Server confirmed vote {
  ideaId: "idea-123",
  voteType: "UP",
  serverVotesCount: 11,
  serverUserVote: { type: "UP" }
}

// 7. SETTLED - CACHE INVALIDATION
🔄 [VOTE_MUTATION] onSettled - Triggering cache invalidation

✅ [VOTE_MUTATION] Cache invalidation triggered

🏁 [IDEA_CARD] Vote mutation settled

🔓 [IDEA_CARD] Clearing pending vote state
```

### Error Case (With Rollback)

```javascript
// ... (same as above until API call)

// SERVER ERROR
❌ [VOTE_API_CALL] Request failed {
  status: 401,
  error: "Unauthorized"
}

// ROLLBACK TRIGGERED
❌ [VOTE_MUTATION] onError - Mutation failed {
  ideaId: "idea-123",
  voteType: "UP",
  error: "Unauthorized - Please sign in to vote"
}

⏮️ [VOTE_MUTATION] Rolling back to previous cache state

✅ [VOTE_MUTATION] Rollback completed successfully

🔄 [VOTE_MUTATION] onSettled - Triggering cache invalidation

🏁 [IDEA_CARD] Vote mutation settled

🔓 [IDEA_CARD] Clearing pending vote state
```

## 🔍 Debugging Scenarios

### Scenario 1: Vote Not Working

**Check these logs in order:**

1. **Button Click Registered?**
   ```
   Look for: 🖱️ [IDEA_CARD] Vote button clicked
   ```
   - ✅ Found → Continue
   - ❌ Missing → Check onClick binding in IdeaCard

2. **Mutation Started?**
   ```
   Look for: 🟡 [VOTE_MUTATION] onMutate started
   ```
   - ✅ Found → Continue
   - ❌ Missing → Check useVoteIdea hook setup

3. **Optimistic Update Applied?**
   ```
   Look for: ✨ [VOTE_MUTATION] Optimistic update applied
   ```
   - ✅ Found → Continue
   - ❌ Missing → Check cache update logic

4. **API Request Sent?**
   ```
   Look for: 🔵 [VOTE_API_CALL] Starting vote submission
   ```
   - ✅ Found → Continue
   - ❌ Missing → Check network connection

5. **Server Received Request?**
   ```
   Look for: 🟢 [API_VOTE] Request received
   ```
   - ✅ Found → Continue
   - ❌ Missing → Check API route configuration

6. **Authentication Passed?**
   ```
   Look for: ✅ [API_VOTE] Authentication successful
   ```
   - ✅ Found → Continue
   - ❌ Missing → User not logged in

7. **Vote Created/Updated?**
   ```
   Look for: ✅ [API_VOTE] Vote created successfully
   ```
   - ✅ Found → Working!
   - ❌ Missing → Check database connection

### Scenario 2: Vote Count Wrong

**Look for delta calculations:**

```
Search logs for: [VOTE_MUTATION] Case 1/2/3
```

Check the delta values:
- **Case 1** (Remove): delta should be -1 (UP) or +1 (DOWN)
- **Case 2** (Switch): delta should be +2 (UP) or -2 (DOWN)
- **Case 3** (New): delta should be +1 (UP) or -1 (DOWN)

### Scenario 3: Multiple Posts Affected

**Check idea ID isolation:**

```
Search logs for: ideaId
```

Each log should show:
- Same ideaId throughout a single vote operation
- Different ideaIds for different posts

If you see one ideaId affecting another:
- ❌ Problem in cache update logic
- Check: `if (idea.id !== ideaId) return idea;`

### Scenario 4: UI Not Reverting on Error

**Check rollback logs:**

```
Look for: ⏮️ [VOTE_MUTATION] Rolling back to previous cache state
```

- ✅ Found → Rollback executed
- ❌ Missing → Check onError handler

Then check:
```
Look for: ✅ [VOTE_MUTATION] Rollback completed successfully
```

- ✅ Found → Rollback worked
- ❌ Missing → Context missing or cache corruption

## 📊 Log Filtering Tips

### Browser Console Filters

**Show only vote-related logs:**
```
[VOTE_MUTATION] OR [VOTE_API_CALL] OR [IDEA_CARD]
```

**Show only errors:**
```
❌ OR ⚠️
```

**Show specific idea:**
```
idea-123
```

**Show authentication:**
```
[API_VOTE] AND 🔐
```

**Show optimistic updates:**
```
⚡ OR ✨
```

### Server Console Filters

**Show only API vote logs:**
```
[API_VOTE]
```

**Show only errors:**
```
❌ OR 💥
```

**Show database operations:**
```
📊 OR 🗳️
```

## 🛠️ Custom Logging

### Add Your Own Logs

#### In Components:
```typescript
console.log("🎨 [IDEA_CARD] Your custom message", {
  ideaId: id,
  customData: yourData,
});
```

#### In Hooks:
```typescript
console.log("🔵 [VOTE_MUTATION] Your custom message", {
  data: yourData,
  timestamp: new Date().toISOString(),
});
```

#### In API Routes:
```typescript
console.log("🟢 [API_VOTE] Your custom message", {
  requestId,
  data: yourData,
});
```

### Conditional Logging (Production)

Add environment check:
```typescript
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log("🔍 [DEBUG] Detailed debug info", { data });
}
```

## 📈 Performance Monitoring

### Track Vote Duration

Client-side:
```
1. Note timestamp in: 🖱️ [IDEA_CARD] Vote button clicked
2. Note timestamp in: 🏁 [IDEA_CARD] Vote mutation settled
3. Calculate difference
```

Server-side:
```
Look for: duration: "45ms" in 🎉 [API_VOTE] Request completed
```

### Track Cache Operations

```
Search for:
- 📸 [VOTE_MUTATION] Cache snapshot created
- ⚡ [VOTE_MUTATION] Starting optimistic cache update
- ✨ [VOTE_MUTATION] Optimistic update applied
```

Time between these = Cache update performance

## 🎯 Best Practices

### ✅ DO
- Keep logs consistent with emoji prefixes
- Include relevant context (ideaId, voteType, etc.)
- Log both success and failure paths
- Use structured objects for data
- Add timestamps for timing-critical operations

### ❌ DON'T
- Log sensitive user data (passwords, tokens)
- Log in tight loops (performance impact)
- Use generic messages ("error", "success")
- Forget to remove debug logs before commit
- Log entire objects (can be huge)

## 🔐 Security Notes

**Never log:**
- Authentication tokens
- Session IDs
- User passwords
- API keys
- Personal identifiable information (PII)

**Safe to log:**
- User IDs (hashed if possible)
- Request IDs
- Timestamps
- Vote types
- Counts and deltas

## 📚 Log Examples by Feature

### Component Mount
```javascript
📦 [IDEA_WRAPPER] Component mounted/rendered
📊 [IDEA_WRAPPER] Query state {
  isLoading: false,
  pagesCount: 1,
  totalIdeas: 5
}
```

### Infinite Scroll
```javascript
👁️ [IDEA_WRAPPER] Setting up Intersection Observer
🔄 [IDEA_WRAPPER] Load more trigger intersected
⬇️ [IDEA_WRAPPER] Fetching next page
```

### Empty State
```javascript
📭 [IDEA_WRAPPER] No ideas to display - showing empty state
```

### Error State
```javascript
❌ [IDEA_WRAPPER] Error state {
  error: "Failed to fetch ideas"
}
```

---

**This logging system provides complete visibility into every operation in the voting system.**  
Use the emoji prefixes and log categories to quickly identify and debug issues.
