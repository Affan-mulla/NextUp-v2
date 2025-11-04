# Session Management Documentation Index

A guided map to all session management docs and examples in this repository.

## Guides
- Setup & Architecture
  - Architecture Overview: ../architecture/ARCHITECTURE_DIAGRAMS.md
  - Zustand Architecture: ../architecture/ZUSTAND_ARCHITECTURE.md
  - Implementation Summary: ./IMPLEMENTATION_SUMMARY.md
- How-To Guides
  - Session Management Guide: ./SESSION_MANAGEMENT_GUIDE.md
  - Quick Reference: ./QUICK_REFERENCE.md
  - Zustand Implementation: ./ZUSTAND_IMPLEMENTATION.md
  - Zustand Quickstart: ./ZUSTAND_QUICKSTART.md
  - Middleware Guide: ./MIDDLEWARE_GUIDE.md
- Checklists
  - Migration Checklist: ../checklists/MIGRATION_CHECKLIST.md

## Code Entry Points
- Zustand Store: ../../lib/store/user-store.ts
- Session Provider: ../../components/providers/session-provider.tsx
- React Query Provider: ../../components/providers/react-query-provider.tsx
- Session Hook (TanStack Query): ../../lib/hooks/useSession.ts
- Better Auth Client: ../../lib/auth/auth-client.ts
- Session Utils: ../../lib/auth/session-utils.ts
- Session API Route: ../../app/api/session/route.ts
- Middleware (proxy): ../../proxy.ts

## Examples
- Store Usage Examples: ../../components/examples/session-usage-examples.tsx
- User Store Example: ../../components/examples/user-store-example.tsx

## Notes
- All client-side session data is stored securely in sessionStorage only.
- Session tokens are never stored on the client—Better Auth uses HTTP-only cookies.
- Middleware protects protected routes using the Better Auth session cookie only.
- Server-side routes and API calls validate the session authoritatively when needed.
