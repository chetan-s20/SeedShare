-- ============================================
-- SAFE Member Count Fix - No Errors!
-- ============================================
-- This script only updates member counts
-- No policies, no triggers - just fixes the count
-- 100% safe to run multiple times

-- Fix all community member counts
UPDATE communities
SET member_count = (
    SELECT COUNT(*) 
    FROM community_members 
    WHERE community_members.community_id = communities.id
);

-- Show results
SELECT 
    name as "Community Name",
    member_count as "Member Count",
    (SELECT string_agg(p.full_name, ', ') 
     FROM community_members cm 
     JOIN profiles p ON cm.user_id = p.id 
     WHERE cm.community_id = communities.id) as "Members"
FROM communities
ORDER BY name;
