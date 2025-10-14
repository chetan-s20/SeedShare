-- Verification Query for Tagged User Feature
-- Run this in Supabase SQL Editor to check if the feature is properly set up

-- 1. Check if tagged_user_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'seed_requests' 
  AND column_name = 'tagged_user_id';

-- Expected result: Should show one row with:
-- column_name: tagged_user_id
-- data_type: uuid
-- is_nullable: YES

-- 2. Check if index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'seed_requests' 
  AND indexname = 'idx_seed_requests_tagged_user';

-- Expected result: Should show one row with the index definition

-- 3. Check if foreign key constraint exists
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'seed_requests' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'tagged_user_id';

-- Expected result: Should show foreign key to profiles(id)

-- 4. Check existing seed_requests structure
SELECT 
    requester_id,
    seed_id,
    tagged_user_id,
    status,
    created_at
FROM seed_requests
LIMIT 5;

-- 5. Count total users in profiles (for tagging)
SELECT COUNT(*) as total_users FROM profiles;

-- 6. Sample query: Get requests with tagged users
SELECT 
    sr.id,
    sr.status,
    requester.full_name as requester_name,
    tagged.full_name as tagged_name,
    s.common_name as seed_name
FROM seed_requests sr
LEFT JOIN profiles requester ON sr.requester_id = requester.id
LEFT JOIN profiles tagged ON sr.tagged_user_id = tagged.id
LEFT JOIN seeds s ON sr.seed_id = s.id
LIMIT 10;

-- If column doesn't exist, run this migration:
/*
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
*/
