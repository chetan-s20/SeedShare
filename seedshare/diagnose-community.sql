-- Quick diagnostic to check if community tables exist
-- Run this in Supabase SQL Editor

-- Check if community tables exist
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Run supabase-COMPLETE-SAFE.sql'
    END as status
FROM (VALUES 
    ('community_posts'),
    ('post_votes'),
    ('post_comments'),
    ('comment_votes'),
    ('saved_posts'),
    ('community_settings')
) AS t(table_name);

-- Check if RLS is enabled and has policies
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('community_posts', 'post_votes', 'saved_posts')
ORDER BY tablename;

-- Count existing posts
SELECT 
    COUNT(*) as total_posts,
    COUNT(DISTINCT author_id) as unique_authors
FROM community_posts;
