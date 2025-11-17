# 🚀 Ideas Feed System - Quick Command Reference

## Development Commands

### Start Development Server
```powershell
npm run dev
```
Access at: http://localhost:3000

### Build for Production
```powershell
npm run build
```

### Start Production Server
```powershell
npm run start
```

### Type Checking
```powershell
npx tsc --noEmit
```

### Linting
```powershell
npm run lint
```

## Database Commands

### Generate Prisma Client
```powershell
npx prisma generate
```

### Push Schema to Database
```powershell
npx prisma db push
```

### Open Prisma Studio (Database GUI)
```powershell
npx prisma studio
```

### Create Migration
```powershell
npx prisma migrate dev --name add_ideas_feed
```

### Run Migrations
```powershell
npx prisma migrate deploy
```

### Reset Database (DEV ONLY!)
```powershell
npx prisma migrate reset
```

## Supabase Commands (if using Supabase CLI)

### Link to Project
```powershell
npx supabase link --project-ref your-project-ref
```

### Generate TypeScript Types
```powershell
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### Run Local Supabase
```powershell
npx supabase start
```

### Stop Local Supabase
```powershell
npx supabase stop
```

## Testing & Debugging

### Check All TypeScript Errors
```powershell
npx tsc --noEmit --watch
```

### Run ESLint
```powershell
npm run lint -- --fix
```

### Check Bundle Size
```powershell
npm run build
# Then check .next/analyze output
```

### Clear Next.js Cache
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Clear Node Modules & Reinstall
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Git Commands for This Feature

### Create Feature Branch
```powershell
git checkout -b feature/ideas-feed-system
```

### Stage All Changes
```powershell
git add .
```

### Commit Changes
```powershell
git commit -m "feat: implement production-grade ideas feed system

- Add server-side data fetching with Supabase
- Implement infinite scroll with React Query
- Add optimistic UI updates for voting
- Create loading skeletons and error states
- Add comprehensive documentation
"
```

### Push to Remote
```powershell
git push origin feature/ideas-feed-system
```

### Create Pull Request
```powershell
# Using GitHub CLI (if installed)
gh pr create --title "Ideas Feed System" --body "Complete implementation of production-grade feed"
```

## Environment Setup

### Copy Environment Variables
```powershell
Copy-Item .env.example .env.local
# Then edit .env.local with your values
```

### Check Environment Variables
```powershell
# In PowerShell
Get-Content .env.local
```

## Package Management

### Install All Dependencies
```powershell
npm install
```

### Install Specific Package
```powershell
npm install @tanstack/react-query@latest
```

### Update All Packages
```powershell
npm update
```

### Check for Outdated Packages
```powershell
npm outdated
```

### Audit for Security Issues
```powershell
npm audit
npm audit fix
```

## Performance Analysis

### Analyze Bundle Size
```powershell
npm run build
# Add this to package.json if not present:
# "analyze": "ANALYZE=true npm run build"
```

### Run Lighthouse Audit
```powershell
npm run build
npm run start
# Then in Chrome DevTools > Lighthouse > Run audit
```

### Profile React Components
```powershell
npm run dev
# Then in React DevTools > Profiler > Start profiling
```

## Debugging

### Enable Verbose Logging (React Query)
```typescript
// In react-query-provider.tsx, add:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In component:
<ReactQueryDevtools initialIsOpen={false} />
```

### Check API Routes Locally
```powershell
# GET request
curl http://localhost:3000/api/ideas

# POST request
curl -X POST http://localhost:3000/api/ideas/vote `
  -H "Content-Type: application/json" `
  -d '{"ideaId":"123","type":"UP"}'
```

### View Next.js Build Info
```powershell
npm run build -- --debug
```

### Check Node Version
```powershell
node --version
npm --version
```

## Database Queries (Run in Supabase SQL Editor)

### Check Indexes
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Ideas', 'Votes', 'Comments')
ORDER BY tablename, indexname;
```

### Count Ideas
```sql
SELECT COUNT(*) FROM "Ideas";
```

### Top Voted Ideas
```sql
SELECT 
  "Ideas"."title",
  "Ideas"."votesCount",
  "User"."username"
FROM "Ideas"
LEFT JOIN "User" ON "Ideas"."userId" = "User"."id"
ORDER BY "Ideas"."votesCount" DESC
LIMIT 10;
```

### Check Vote Distribution
```sql
SELECT 
  "type",
  COUNT(*) as count
FROM "Votes"
GROUP BY "type";
```

### Find Ideas Without Votes
```sql
SELECT 
  "Ideas"."id",
  "Ideas"."title",
  "Ideas"."votesCount"
FROM "Ideas"
WHERE "votesCount" = 0;
```

## Deployment Commands

### Deploy to Vercel
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variable (Vercel)
```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### View Deployment Logs (Vercel)
```powershell
vercel logs
```

## Useful One-Liners

### Find Large Files
```powershell
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 1MB} | Sort-Object Length -Descending | Select-Object Name, @{Name="Size(MB)";Expression={"{0:N2}" -f ($_.Length / 1MB)}}
```

### Count Lines of Code
```powershell
(Get-ChildItem -Include *.tsx,*.ts -Recurse | Get-Content | Measure-Object -Line).Lines
```

### Find TODO Comments
```powershell
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "TODO" | Select-Object Line, LineNumber, Path
```

### Clear All Caches
```powershell
Remove-Item -Recurse -Force .next, node_modules\.cache, .turbo -ErrorAction SilentlyContinue
```

## Documentation Generation

### View All Documentation
```powershell
# Open in VS Code
code docs/guides/IDEAS_FEED_SYSTEM.md
code docs/guides/IDEAS_FEED_QUICKSTART.md
code docs/guides/IDEAS_FEED_IMPLEMENTATION_SUMMARY.md
code docs/architecture/IDEAS_FEED_ARCHITECTURE.md
code docs/checklists/IDEAS_FEED_DEPLOYMENT_CHECKLIST.md
```

### Create README
```powershell
# Combine all docs into main README
Get-Content docs/guides/*.md | Set-Content README_FEED_SYSTEM.md
```

## Monitoring & Logs

### View Next.js Build Logs
```powershell
npm run build > build.log 2>&1
Get-Content build.log
```

### Watch Development Logs
```powershell
npm run dev 2>&1 | Tee-Object -FilePath dev.log
```

### Check Package Sizes
```powershell
npm run build
Get-ChildItem .next/static -Recurse | Measure-Object -Property Length -Sum
```

## Quick Fixes

### Fix Permission Issues
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Fix Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

### Fix Module Not Found
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npx prisma generate
```

## CI/CD Commands (GitHub Actions)

### Run Tests Locally (if configured)
```powershell
npm test
```

### Build Docker Image (if using Docker)
```powershell
docker build -t nextup-ideas-feed .
docker run -p 3000:3000 nextup-ideas-feed
```

## Backup & Restore

### Backup Database (Supabase)
```powershell
# Via Supabase Dashboard > Database > Backups
# Or using pg_dump
pg_dump $env:DATABASE_URL > backup.sql
```

### Restore Database
```powershell
psql $env:DATABASE_URL < backup.sql
```

## Emergency Commands

### Rollback Last Commit
```powershell
git revert HEAD
git push
```

### Hard Reset (DANGER!)
```powershell
git reset --hard HEAD~1
git push --force
```

### Revert to Previous Deployment (Vercel)
```powershell
vercel rollback
```

### Check Production Errors
```powershell
# Vercel logs
vercel logs --follow

# Supabase logs
# Visit: https://supabase.com/dashboard/project/_/logs
```

## Keyboard Shortcuts (VS Code)

- `Ctrl+Shift+P` - Command Palette
- `Ctrl+P` - Quick Open File
- `Ctrl+`` - Toggle Terminal
- `Ctrl+Shift+F` - Search Across Files
- `F12` - Go to Definition
- `Shift+F12` - Find All References
- `Ctrl+Space` - Trigger Autocomplete
- `Ctrl+.` - Quick Fix

## Quick Access URLs

### Local Development
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- React Query Devtools: http://localhost:3000 (overlay)

### Production (Replace with your URLs)
- App: https://your-app.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard/project/[ref]
- Vercel Dashboard: https://vercel.com/your-team/your-project
- Error Tracking: https://sentry.io/[your-org]/[your-project]

## Help & Resources

### Documentation
```powershell
code docs/guides/IDEAS_FEED_QUICKSTART.md
```

### Check Logs
```powershell
# Next.js
cat .next/trace

# Vercel
vercel logs
```

### Get Help
```powershell
# Next.js
npx next --help

# Prisma
npx prisma --help

# npm
npm help <command>
```

---

**💡 Pro Tips:**

1. Always run `npm run build` before deploying
2. Use `npx prisma studio` to inspect database visually
3. Enable React Query Devtools in development
4. Check Supabase dashboard for query performance
5. Use `git stash` before switching branches
6. Keep environment variables in password manager

**🔧 Common Issues:**

| Issue | Command |
|-------|---------|
| Port in use | `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` |
| Stale cache | `Remove-Item -Recurse -Force .next; npm run dev` |
| Type errors | `npx prisma generate; npm run dev` |
| Module not found | `npm install; npx prisma generate` |

---

**Last Updated**: November 7, 2025
**Status**: Production Ready ✅
