-- Update seed_requests table to allow null seed_id for general requests
-- This enables users to create requests without specifying a particular seed

-- Step 1: Check current constraint
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'seed_requests'::regclass
  AND conname LIKE '%seed_id%';

-- Step 2: Make seed_id nullable (if not already)
ALTER TABLE seed_requests 
ALTER COLUMN seed_id DROP NOT NULL;

-- Step 3: Add tagged_user_id column if it doesn't exist
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
CREATE INDEX IF NOT EXISTS idx_seed_requests_seed_id_null ON seed_requests(seed_id) WHERE seed_id IS NULL;

-- Step 5: Add check constraint to ensure general requests have a tagged user
ALTER TABLE seed_requests 
ADD CONSTRAINT check_general_request_has_tag 
CHECK (
  (seed_id IS NOT NULL) OR 
  (seed_id IS NULL AND tagged_user_id IS NOT NULL)
);

-- Step 6: Comment for documentation
COMMENT ON COLUMN seed_requests.seed_id IS 'Specific seed being requested. NULL for general community requests.';
COMMENT ON COLUMN seed_requests.tagged_user_id IS 'User tagged in request. Required when seed_id is NULL.';
COMMENT ON CONSTRAINT check_general_request_has_tag ON seed_requests IS 
'General requests (seed_id = NULL) must have a tagged_user_id';

-- Verification queries
-- Check if changes applied
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'seed_requests'
  AND column_name IN ('seed_id', 'tagged_user_id')
ORDER BY ordinal_position;

-- Test query: Find all general requests
SELECT 
    sr.id,
    sr.requester_id,
    sr.seed_id,
    sr.tagged_user_id,
    sr.message,
    sr.status,
    requester.full_name as requester_name,
    tagged.full_name as tagged_name
FROM seed_requests sr
LEFT JOIN profiles requester ON sr.requester_id = requester.id
LEFT JOIN profiles tagged ON sr.tagged_user_id = tagged.id
WHERE sr.seed_id IS NULL;
