-- SIMPLE STORAGE RLS FIX
-- Use this if you get permission errors with the full script
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Create QR CODES bucket policies
-- ============================================

CREATE POLICY IF NOT EXISTS "qr_codes_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-codes');

CREATE POLICY IF NOT EXISTS "qr_codes_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY IF NOT EXISTS "qr_codes_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY IF NOT EXISTS "qr_codes_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 2: Create SEED IMAGES bucket policies
-- ============================================

CREATE POLICY IF NOT EXISTS "seed_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seed-images');

CREATE POLICY IF NOT EXISTS "seed_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seed-images');

CREATE POLICY IF NOT EXISTS "seed_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'seed-images');

CREATE POLICY IF NOT EXISTS "seed_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 3: Create PRODUCT IMAGES bucket policies
-- ============================================

CREATE POLICY IF NOT EXISTS "product_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "product_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 4: Create AVATARS bucket policies
-- ============================================

CREATE POLICY IF NOT EXISTS "avatars_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 5: Create COMMUNITY IMAGES bucket policies
-- ============================================

CREATE POLICY IF NOT EXISTS "community_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-images');

CREATE POLICY IF NOT EXISTS "community_images_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-images');

CREATE POLICY IF NOT EXISTS "community_images_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid()::text = owner::text)
WITH CHECK (bucket_id = 'community-images');

CREATE POLICY IF NOT EXISTS "community_images_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-images' AND auth.uid()::text = owner::text);

-- ============================================
-- STEP 6: Create bucket-level policy
-- ============================================

CREATE POLICY IF NOT EXISTS "buckets_select_policy"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- Success!
SELECT '✅ Storage policies created successfully!' as status;
SELECT '📊 Total policies: 20 for storage.objects + 1 for storage.buckets' as info;
