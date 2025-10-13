-- Check actual member counts vs stored member_count
SELECT 
    c.id,
    c.name,
    c.member_count as stored_count,
    COUNT(cm.id) as actual_count,
    COUNT(cm.id) - c.member_count as difference
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
GROUP BY c.id, c.name, c.member_count
ORDER BY c.name;

-- Fix member counts to match actual members
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
WHERE communities.id = subquery.id
AND communities.member_count != subquery.actual_count;
