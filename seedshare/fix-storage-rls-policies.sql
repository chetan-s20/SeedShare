-- FIX STORAGE RLS POLICIES
-- Run this in Supabase SQL Editor to fix "new row violates row-level security policy" errors
-- 
-- NOTE: Run each section separately if you get permission errors
-- This script is safe to run multiple times

-- ============================================
-- IMPORTANT: First, ensure buckets exist!
-- ============================================
-- Go to Supabase Dashboard → Storage → Create these buckets:
-- 1. qr-codes (Public)
-- 2. seed-images (Public)
-- 3. product-images (Public)
-- 4. avatars (Public)
-- 5. community-images (Public)

-- ============================================
-- STEP 1: Drop existing storage policies (if any)
-- ============================================
-- Note: If you get permission errors, skip this step and proceed to Step 2

DROP POLICY IF EXISTS "qr_codes_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "qr_codes_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "seed_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "seed_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "seed_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "seed_images_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "product_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "community_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "community_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "community_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "community_images_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "buckets_select_policy" ON storage.buckets;

-- ============================================
-- STEP 3: Create QR CODES bucket policies
-- ============================================

-- Allow everyone to view QR codes
CREATE POLICY "qr_codes_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-codes');

-- Allow authenticated users to upload QR codes
CREATE POLICY "qr_codes_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-codes');

-- Allow authenticated users to update their own QR codes
CREATE POLICY "qr_codes_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'qr-codes');

-- Allow authenticated users to delete their own QR codes
CREATE POLICY "qr_codes_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 4: Create SEED IMAGES bucket policies
-- ============================================

-- Allow everyone to view seed images
CREATE POLICY "seed_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seed-images');

-- Allow authenticated users to upload seed images
CREATE POLICY "seed_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seed-images');

-- Allow authenticated users to update their own seed images
CREATE POLICY "seed_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'seed-images');

-- Allow authenticated users to delete their own seed images
CREATE POLICY "seed_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 5: Create PRODUCT IMAGES bucket policies
-- ============================================

-- Allow everyone to view product images
CREATE POLICY "product_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "product_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own product images
CREATE POLICY "product_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete their own product images
CREATE POLICY "product_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 6: Create AVATARS bucket policies
-- ============================================

-- Allow everyone to view avatars
CREATE POLICY "avatars_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "avatars_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "avatars_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'avatars');

-- Allow users to delete their own avatar
CREATE POLICY "avatars_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 7: Create COMMUNITY IMAGES bucket policies
-- ============================================

-- Allow everyone to view community images
CREATE POLICY "community_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-images');

-- Allow authenticated users to upload community images
CREATE POLICY "community_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-images');

-- Allow authenticated users to update community images
CREATE POLICY "community_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'community-images');

-- Allow authenticated users to delete community images
CREATE POLICY "community_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 8: Create bucket-level policies
-- ============================================

-- Allow everyone to view buckets
CREATE POLICY "buckets_select_policy"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Storage RLS policies have been successfully updated!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Summary:';
    RAISE NOTICE '  - QR codes bucket: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  - Seed images bucket: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  - Product images bucket: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  - Avatars bucket: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  - Community images bucket: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  - Buckets table: 1 policy (SELECT)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Total: 21 storage policies created';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '  1. Make sure all buckets exist in Supabase Dashboard → Storage';
    RAISE NOTICE '  2. Set all buckets to PUBLIC (not private)';
    RAISE NOTICE '  3. Test file upload functionality';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Required Buckets:';
    RAISE NOTICE '  - qr-codes (Public)';
    RAISE NOTICE '  - seed-images (Public)';
    RAISE NOTICE '  - product-images (Public)';
    RAISE NOTICE '  - avatars (Public)';
    RAISE NOTICE '  - community-images (Public)';
END $$;
