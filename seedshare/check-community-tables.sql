-- Quick check to see if community tables exist in your database
-- Run this in Supabase SQL Editor to verify table status

SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ EXISTS'
        ELSE '❌ NOT FOUND'
    END as status
FROM (
    VALUES 
        ('community_posts'),
        ('post_votes'),
        ('post_comments'),
        ('comment_votes'),
        ('saved_posts'),
        ('community_settings')
) AS t(table_name)
ORDER BY table_name;

-- Also check if main tables exist
SELECT 
    COUNT(*) as total_tables,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'seeds', 'communities', 'community_members',
    'community_posts', 'post_votes', 'post_comments'
  );
