-- ============================================
-- Auto-sync Community Member Counts
-- ============================================
-- This trigger automatically updates the member_count column
-- whenever someone joins or leaves a community

-- Function to update member count
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
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS community_member_count_insert ON community_members;
CREATE TRIGGER community_member_count_insert
AFTER INSERT ON community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

-- Create trigger for DELETE  
DROP TRIGGER IF EXISTS community_member_count_delete ON community_members;
CREATE TRIGGER community_member_count_delete
AFTER DELETE ON community_members
FOR EACH ROW
EXECUTE FUNCTION update_community_member_count();

-- ============================================
-- Fix existing counts (run once to sync all communities)
-- ============================================
UPDATE communities
SET member_count = subquery.actual_count
FROM (
    SELECT 
        c.id,
        COUNT(cm.id) as actual_count
    FROM communities c
    LEFT JOIN community_members cm ON c.id = cm.community_id
    GROUP BY c.id
) AS subquery
WHERE communities.id = subquery.id;

-- Verify the fix
SELECT 
    c.id,
    c.name,
    c.member_count as stored_count,
    COUNT(cm.id) as actual_count
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
GROUP BY c.id, c.name, c.member_count
ORDER BY c.name;
