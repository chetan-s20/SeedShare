-- ============================================
-- Safe Member Count Fix and Trigger Setup
-- ============================================
-- This script is safe to run multiple times

-- 1. First, fix all existing member counts to match reality
UPDATE communities
SET member_count = subquery.actual_count
FROM (
    SELECT 
        c.id,
        COALESCE(COUNT(cm.id), 0) as actual_count
    FROM communities c
    LEFT JOIN community_members cm ON c.id = cm.community_id
    GROUP BY c.id
) AS subquery
WHERE communities.id = subquery.id;

-- 2. Create function to auto-update member counts (drops if exists first)
DROP FUNCTION IF EXISTS update_community_member_count() CASCADE;

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Someone joined - increment count
        UPDATE communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Someone left - decrement count (never go below 0)
        UPDATE communities 
        SET member_count = GREATEST(member_count - 1, 0) 
        WHERE id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers (DROP IF EXISTS first to avoid errors)
DROP TRIGGER IF EXISTS community_member_count_insert ON community_members;
CREATE TRIGGER community_member_count_insert
AFTER INSERT ON community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

DROP TRIGGER IF EXISTS community_member_count_delete ON community_members;
CREATE TRIGGER community_member_count_delete
AFTER DELETE ON community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

-- 4. Verify the fix worked
SELECT 
    c.id,
    c.name,
    c.member_count as stored_count,
    COUNT(cm.id) as actual_count,
    CASE 
        WHEN c.member_count = COUNT(cm.id) THEN '✅ Correct'
        ELSE '❌ Mismatch'
    END as status
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
GROUP BY c.id, c.name, c.member_count
ORDER BY c.name;
