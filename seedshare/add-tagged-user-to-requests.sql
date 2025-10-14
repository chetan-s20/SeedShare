-- Add tagged_user_id column to seed_requests table
-- This allows users to tag/direct their request to a specific user

ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN seed_requests.tagged_user_id IS 'Optional: Specific user being tagged/directed with this request';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);

-- Update the existing seed_requests table to support tagging feature
-- This allows users to:
-- 1. Make general requests for any seed (tagged_user_id = NULL)
-- 2. Tag a specific user when requesting their seed (tagged_user_id = specific user)
