-- Create Storage Bucket for Seed Images
-- Run this in Supabase SQL Editor

-- Create the seed-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seed-images',
  'seed-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create RLS policies for seed-images bucket

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view seed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload seed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own seed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own seed images" ON storage.objects;

-- 1. Allow public SELECT (viewing images)
CREATE POLICY "Public can view seed images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seed-images');

-- 2. Allow authenticated users to INSERT
CREATE POLICY "Authenticated users can upload seed images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seed-images');

-- 3. Allow users to UPDATE their own files
CREATE POLICY "Users can update their own seed images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'seed-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to DELETE their own files
CREATE POLICY "Users can delete their own seed images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'seed-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Success message
SELECT 
  'Seed-images storage bucket created successfully!' as message,
  'Bucket ID: seed-images' as details,
  'Public: Yes, Size limit: 5MB' as settings;

-- Verify bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'seed-images';
