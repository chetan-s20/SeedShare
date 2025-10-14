-- Seed Image Classification - Setup Verification
-- Run this to check if everything is configured correctly

-- 1. Check if seed_image_analysis table exists
SELECT 
  'seed_image_analysis table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'seed_image_analysis'
    ) THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND - Run supabase-seed-analysis-schema.sql'
  END as status;

-- 2. Check table structure
SELECT 
  'Table columns' as check_name,
  COUNT(*) || ' columns found' as status
FROM information_schema.columns
WHERE table_name = 'seed_image_analysis';

-- 3. List all columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seed_image_analysis'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
  'RLS Policies' as check_name,
  COUNT(*) || ' policies found' as status
FROM pg_policies
WHERE tablename = 'seed_image_analysis';

-- 5. List all RLS policies
SELECT 
  policyname as policy_name,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'seed_image_analysis';

-- 6. Check storage buckets (if storage schema is accessible)
SELECT 
  'Storage Buckets' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT FROM storage.buckets 
      WHERE name = 'seed-images'
    ) THEN '✅ seed-images bucket exists'
    ELSE '❌ seed-images bucket NOT FOUND'
  END as status;

-- 7. Check bucket configuration
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'seed-images';

-- 8. Test data - Count existing analyses
SELECT 
  'Existing analyses' as check_name,
  COUNT(*) || ' records found' as status
FROM seed_image_analysis;

-- SETUP INSTRUCTIONS IF CHECKS FAIL:

-- If seed_image_analysis table not found:
-- Run: supabase-seed-analysis-schema.sql

-- If seed-images bucket not found:
-- Go to Supabase Dashboard → Storage → Create Bucket
-- Name: seed-images
-- Public: Yes
-- File size limit: 5242880 (5MB)
-- Allowed MIME types: image/*

-- If RLS policies missing:
-- Re-run: supabase-seed-analysis-schema.sql
