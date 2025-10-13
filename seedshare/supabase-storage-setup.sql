-- =====================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor after creating buckets
-- =====================================================

-- Note: Storage buckets must be created through the Supabase Dashboard first!
-- Go to: Storage → Create a new bucket

-- CREATE THESE BUCKETS IN SUPABASE DASHBOARD:
-- 1. qr-codes (Public bucket)
-- 2. seed-images (Public bucket)
-- 3. product-images (Public bucket)
-- 4. avatars (Public bucket)
-- 5. community-images (Public bucket)

-- After creating buckets, run these policies:

-- =====================================================
-- QR CODES BUCKET POLICIES
-- =====================================================

-- Allow public read access to QR codes
CREATE POLICY "Public QR codes are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-codes');

-- Allow authenticated users to upload QR codes
CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-codes');

-- Allow users to update their own QR codes
CREATE POLICY "Users can update their own QR codes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own QR codes
CREATE POLICY "Users can delete their own QR codes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- SEED IMAGES BUCKET POLICIES
-- =====================================================

-- Allow public read access to seed images
CREATE POLICY "Public seed images are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seed-images');

-- Allow authenticated users to upload seed images
CREATE POLICY "Authenticated users can upload seed images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seed-images');

-- Allow users to update their own seed images
CREATE POLICY "Users can update their own seed images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own seed images
CREATE POLICY "Users can delete their own seed images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'seed-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

-- Allow public read access to avatars
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if buckets exist (run after creating in dashboard)
SELECT id, name, public, created_at 
FROM storage.buckets 
ORDER BY created_at DESC;

-- Check storage policies
SELECT * 
FROM pg_policies 
WHERE schemaname = 'storage' 
ORDER BY tablename, policyname;
