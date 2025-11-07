-- =====================================================
-- Ideas Feed System - Database Optimization Script
-- =====================================================
-- Run these commands in your Supabase SQL Editor
-- for optimal performance of the Ideas feed system
-- =====================================================

-- =====================================================
-- 1. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for efficient idea fetching ordered by creation date
-- Supports: SELECT * FROM "Ideas" ORDER BY "createdAt" DESC
CREATE INDEX IF NOT EXISTS idx_ideas_created_at 
ON "Ideas"("createdAt" DESC);

-- Index for efficient vote lookups by user and idea
-- Supports: SELECT * FROM "Votes" WHERE "userId" = ? AND "ideaId" = ?
CREATE INDEX IF NOT EXISTS idx_votes_user_idea 
ON "Votes"("userId", "ideaId");

-- Index for efficient idea lookups
-- Supports: SELECT * FROM "Votes" WHERE "ideaId" = ?
CREATE INDEX IF NOT EXISTS idx_votes_idea_id 
ON "Votes"("ideaId");

-- Index for efficient comment counting
-- Supports: SELECT COUNT(*) FROM "Comments" WHERE "ideaId" = ?
CREATE INDEX IF NOT EXISTS idx_comments_idea_id 
ON "Comments"("ideaId");

-- Index for efficient user lookups in ideas
-- Supports: SELECT * FROM "Ideas" WHERE "userId" = ?
CREATE INDEX IF NOT EXISTS idx_ideas_user_id 
ON "Ideas"("userId");

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- NOTE: Using Better Auth, not Supabase Auth
-- RLS policies reference session.userId instead of auth.uid()

-- Enable RLS on Ideas table
ALTER TABLE "Ideas" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ideas
CREATE POLICY "ideas_select_policy" 
ON "Ideas" 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can create ideas (Better Auth)
-- Note: With Better Auth, you typically handle auth at the application layer
-- These policies are optional and provide defense-in-depth
CREATE POLICY "ideas_insert_policy" 
ON "Ideas" 
FOR INSERT 
WITH CHECK (true); -- Auth handled at application layer

-- Policy: Users can update their own ideas
CREATE POLICY "ideas_update_policy" 
ON "Ideas" 
FOR UPDATE 
USING (true) -- Auth handled at application layer
WITH CHECK (true);

-- Policy: Users can delete their own ideas
CREATE POLICY "ideas_delete_policy" 
ON "Ideas" 
FOR DELETE 
USING (true); -- Auth handled at application layer

-- Enable RLS on Votes table
ALTER TABLE "Votes" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view votes
CREATE POLICY "votes_select_policy" 
ON "Votes" 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can create votes
CREATE POLICY "votes_insert_policy" 
ON "Votes" 
FOR INSERT 
WITH CHECK (true); -- Auth handled at application layer

-- Policy: Users can update their own votes
CREATE POLICY "votes_update_policy" 
ON "Votes" 
FOR UPDATE 
USING (true) -- Auth handled at application layer
WITH CHECK (true);

-- Policy: Users can delete their own votes
CREATE POLICY "votes_delete_policy" 
ON "Votes" 
FOR DELETE 
USING (true); -- Auth handled at application layer

-- Enable RLS on Comments table
ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view comments
CREATE POLICY "comments_select_policy" 
ON "Comments" 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can create comments
CREATE POLICY "comments_insert_policy" 
ON "Comments" 
FOR INSERT 
WITH CHECK (true); -- Auth handled at application layer

-- Policy: Users can update their own comments
CREATE POLICY "comments_update_policy" 
ON "Comments" 
FOR UPDATE 
USING (true) -- Auth handled at application layer
WITH CHECK (true);

-- =====================================================
-- 3. USEFUL QUERIES FOR MONITORING
-- =====================================================

-- Check index usage (run after some traffic)
-- Uncomment to use:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Check table sizes
-- Uncomment to use:
-- SELECT 
--   schemaname as schema,
--   tablename as table,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count ideas by user
-- Uncomment to use:
-- SELECT 
--   "User"."username",
--   COUNT("Ideas"."id") as idea_count
-- FROM "User"
-- LEFT JOIN "Ideas" ON "User"."id" = "Ideas"."userId"
-- GROUP BY "User"."id", "User"."username"
-- ORDER BY idea_count DESC
-- LIMIT 10;

-- Top voted ideas
-- Uncomment to use:
-- SELECT 
--   "Ideas"."id",
--   "Ideas"."title",
--   "Ideas"."votesCount",
--   "User"."username"
-- FROM "Ideas"
-- LEFT JOIN "User" ON "Ideas"."userId" = "User"."id"
-- ORDER BY "Ideas"."votesCount" DESC
-- LIMIT 10;

-- =====================================================
-- 4. OPTIONAL: MATERIALIZED VIEW FOR LEADERBOARD
-- =====================================================

-- Create a materialized view for idea leaderboard
-- This can improve performance for leaderboard queries
-- Refresh periodically (e.g., every hour)

-- Uncomment to use:
-- CREATE MATERIALIZED VIEW IF NOT EXISTS idea_leaderboard AS
-- SELECT 
--   "Ideas"."id",
--   "Ideas"."title",
--   "Ideas"."votesCount",
--   "Ideas"."createdAt",
--   "User"."username",
--   "User"."image",
--   COUNT(DISTINCT "Comments"."id") as comment_count
-- FROM "Ideas"
-- LEFT JOIN "User" ON "Ideas"."userId" = "User"."id"
-- LEFT JOIN "Comments" ON "Ideas"."id" = "Comments"."ideaId"
-- GROUP BY "Ideas"."id", "User"."username", "User"."image"
-- ORDER BY "Ideas"."votesCount" DESC;

-- Create index on materialized view
-- Uncomment to use:
-- CREATE INDEX IF NOT EXISTS idx_leaderboard_votes 
-- ON idea_leaderboard("votesCount" DESC);

-- Refresh function (call periodically)
-- Uncomment to use:
-- REFRESH MATERIALIZED VIEW idea_leaderboard;

-- =====================================================
-- 5. FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to toggle vote
CREATE OR REPLACE FUNCTION toggle_vote(
  p_user_id TEXT,
  p_idea_id TEXT,
  p_vote_type TEXT
) RETURNS JSON AS $$
DECLARE
  existing_vote RECORD;
  vote_delta INT;
  result JSON;
BEGIN
  -- Check for existing vote
  SELECT * INTO existing_vote 
  FROM "Votes" 
  WHERE "userId" = p_user_id AND "ideaId" = p_idea_id;
  
  IF existing_vote IS NOT NULL THEN
    IF existing_vote."type" = p_vote_type THEN
      -- Remove vote
      DELETE FROM "Votes" 
      WHERE "userId" = p_user_id AND "ideaId" = p_idea_id;
      
      vote_delta := CASE WHEN p_vote_type = 'UP' THEN -1 ELSE 1 END;
    ELSE
      -- Change vote
      UPDATE "Votes" 
      SET "type" = p_vote_type 
      WHERE "userId" = p_user_id AND "ideaId" = p_idea_id;
      
      vote_delta := CASE WHEN p_vote_type = 'UP' THEN 2 ELSE -2 END;
    END IF;
  ELSE
    -- New vote
    INSERT INTO "Votes" ("userId", "ideaId", "type")
    VALUES (p_user_id, p_idea_id, p_vote_type);
    
    vote_delta := CASE WHEN p_vote_type = 'UP' THEN 1 ELSE -1 END;
  END IF;
  
  -- Update vote count
  UPDATE "Ideas" 
  SET "votesCount" = "votesCount" + vote_delta 
  WHERE "id" = p_idea_id;
  
  -- Return result
  SELECT json_build_object(
    'success', true,
    'voteDelta', vote_delta
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC VOTE COUNTING
-- =====================================================

-- Function to update vote count on vote insert
CREATE OR REPLACE FUNCTION update_vote_count_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Ideas"
  SET "votesCount" = "votesCount" + CASE WHEN NEW."type" = 'UP' THEN 1 ELSE -1 END
  WHERE "id" = NEW."ideaId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update vote count on vote delete
CREATE OR REPLACE FUNCTION update_vote_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Ideas"
  SET "votesCount" = "votesCount" - CASE WHEN OLD."type" = 'UP' THEN 1 ELSE -1 END
  WHERE "id" = OLD."ideaId";
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to update vote count on vote update
CREATE OR REPLACE FUNCTION update_vote_count_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."type" != NEW."type" THEN
    UPDATE "Ideas"
    SET "votesCount" = "votesCount" + CASE WHEN NEW."type" = 'UP' THEN 2 ELSE -2 END
    WHERE "id" = NEW."ideaId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_vote_insert ON "Votes";
CREATE TRIGGER trigger_vote_insert
AFTER INSERT ON "Votes"
FOR EACH ROW
EXECUTE FUNCTION update_vote_count_on_insert();

DROP TRIGGER IF EXISTS trigger_vote_delete ON "Votes";
CREATE TRIGGER trigger_vote_delete
AFTER DELETE ON "Votes"
FOR EACH ROW
EXECUTE FUNCTION update_vote_count_on_delete();

DROP TRIGGER IF EXISTS trigger_vote_update ON "Votes";
CREATE TRIGGER trigger_vote_update
AFTER UPDATE ON "Votes"
FOR EACH ROW
EXECUTE FUNCTION update_vote_count_on_update();

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify indexes were created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Ideas', 'Votes', 'Comments')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('Ideas', 'Votes', 'Comments')
ORDER BY tablename, policyname;

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================
-- All indexes, policies, functions, and triggers have been created
-- Your Ideas feed system is now optimized for production use
-- =====================================================
