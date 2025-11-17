-- Add foreign key constraint for Ideas -> User relationship
-- This allows Supabase PostgREST to understand the relationship

-- First, ensure all existing userId values reference valid users
-- (Clean up any orphaned records if they exist)
DELETE FROM "Ideas" 
WHERE "userId" NOT IN (SELECT "id" FROM "user");

-- Add the foreign key constraint
ALTER TABLE "Ideas"
DROP CONSTRAINT IF EXISTS "Ideas_userId_fkey";

ALTER TABLE "Ideas"
ADD CONSTRAINT "Ideas_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "user"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Add indexes for performance (if not already exists)
CREATE INDEX IF NOT EXISTS "Ideas_userId_idx" ON "Ideas"("userId");
CREATE INDEX IF NOT EXISTS "Ideas_createdAt_idx" ON "Ideas"("createdAt" DESC);

-- Verify the foreign key was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'Ideas';
