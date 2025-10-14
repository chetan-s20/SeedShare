# 🚀 Seed Image Classification - Complete Setup Guide

## Current Status

✅ Table exists: `seed_image_analysis` (0 records)  
✅ Supabase connection working  
❌ **Storage bucket missing: `seed-images`**  
❌ **Gemini API model version incorrect**

---

## 🔧 Required Fixes

### Fix 1: Create Storage Bucket

**Option A: Using SQL (Recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Copy and run: `create-seed-images-bucket.sql`
3. Verify success message appears

**Option B: Using Dashboard**

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Fill in details:
   - **Name:** `seed-images`
   - **Public:** ✅ Yes (checked)
   - **File size limit:** 5242880 (5MB in bytes)
   - **Allowed MIME types:** Add these individually:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`
4. Click "Create bucket"
5. Go to bucket → Policies → Add these 4 policies:

**Policy 1: Public SELECT**
```sql
CREATE POLICY "Public can view seed images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'seed-images');
```

**Policy 2: Authenticated INSERT**
```sql
CREATE POLICY "Authenticated users can upload seed images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seed-images');
```

**Policy 3: Users UPDATE own files**
```sql
CREATE POLICY "Users can update their own seed images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'seed-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 4: Users DELETE own files**
```sql
CREATE POLICY "Users can delete their own seed images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'seed-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### Fix 2: Update Gemini API Model

✅ **Already fixed in code!** Changed from `gemini-1.5-flash` to `gemini-1.5-flash-latest`

---

## ✅ Complete Setup Checklist

### 1. Database Setup
- [x] Run `supabase-seed-analysis-schema.sql` ✅ (already done - table exists)
- [x] Verify table has RLS policies ✅
- [x] Verify indexes created ✅

### 2. Storage Setup
- [ ] Run `create-seed-images-bucket.sql` ⚠️ **DO THIS NOW**
- [ ] Verify bucket is public
- [ ] Verify 4 RLS policies exist
- [ ] Test upload manually

### 3. API Configuration
- [x] Gemini API key in `.env.local` ✅
- [x] Update to `gemini-1.5-flash-latest` ✅ (fixed in code)
- [ ] Restart dev server ⚠️ **REQUIRED**

### 4. Test Everything
- [ ] Upload test image via chatbot
- [ ] Verify analysis completes
- [ ] Check image appears in Storage
- [ ] Check record in database
- [ ] View analysis history page

---

## 🎯 Quick Start (3 Steps)

### Step 1: Create Storage Bucket
```sql
-- Copy and run in Supabase SQL Editor:
\i create-seed-images-bucket.sql
```

### Step 2: Restart Dev Server
```bash
# In terminal (Ctrl+C to stop, then):
pnpm run dev
```

### Step 3: Test Upload
1. Go to http://localhost:3000/knowledge
2. Click camera icon in chatbot
3. Upload a seed image
4. Click "Analyze"
5. Wait for results

---

## 🐛 Troubleshooting

### Still getting "Failed to upload image"?

**Check bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE id = 'seed-images';
```
Should return 1 row.

**Check policies:**
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'seed-images';
```
Should return 4 policies.

### Still getting "Failed to analyze seed image"?

**Check Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Verify key is valid
3. Test with a simple prompt

**Check API quota:**
- Free tier: 15 requests per minute
- If exceeded, wait 1 minute

**Check browser console:**
- Press F12
- Look for detailed error message
- Share the `details` field

---

## 📊 Verify Setup

Run diagnostic again:
```bash
npx tsx test-seed-analysis-setup.ts
```

Expected output:
```
✅ Supabase connection successful
✅ Table exists (0 records)
✅ Bucket exists
✅ Storage policies configured
✅ Gemini API working
```

---

## 🎉 Success Indicators

When everything works:

1. **Upload succeeds:**
   - No errors in console
   - Image preview shows in chat
   - "Analyzing seed image..." appears

2. **Analysis completes:**
   - Results appear in markdown format
   - Shows condition, diseases, medicines
   - Confidence score displayed

3. **Data saved:**
   - Image appears in Supabase Storage → seed-images
   - Record appears in seed_image_analysis table
   - History page shows the analysis

---

## 🚨 Common Errors & Solutions

### Error: "Bucket not found"
**Solution:** Run `create-seed-images-bucket.sql`

### Error: "404 Not Found - gemini-1.5-flash"
**Solution:** Already fixed! Just restart dev server.

### Error: "Rate limit exceeded"
**Solution:** Wait 1 minute, Gemini free tier allows 15 req/min

### Error: "Invalid API key"
**Solution:** 
1. Get new key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Update `.env.local`:
   ```env
   OPENAI_API_KEY=your_new_gemini_api_key
   ```
3. Restart server

---

## 📞 Need Help?

Run these commands and share output:

```bash
# 1. Check diagnostic
npx tsx test-seed-analysis-setup.ts

# 2. Check bucket in SQL
SELECT * FROM storage.buckets WHERE id = 'seed-images';

# 3. Check policies
SELECT * FROM storage.policies WHERE bucket_id = 'seed-images';

# 4. Check table
SELECT COUNT(*) FROM seed_image_analysis;
```

---

## 🎓 What Each File Does

| File | Purpose |
|------|---------|
| `supabase-seed-analysis-schema.sql` | Creates database table |
| `create-seed-images-bucket.sql` | Creates storage bucket + policies |
| `verify-seed-analysis-setup.sql` | Checks if setup is correct |
| `test-seed-analysis-setup.ts` | Runs automated diagnostics |
| `app/api/analyze-seed/route.ts` | Backend API endpoint |
| `components/knowledge/ai-chatbot.tsx` | Frontend UI |
| `app/knowledge/analysis-history/page.tsx` | View past analyses |

---

## 🏁 Final Steps

1. ✅ Run `create-seed-images-bucket.sql`
2. ✅ Restart dev server
3. ✅ Test upload
4. ✅ Check results
5. ✅ Celebrate! 🎉

The feature is **production-ready** once the storage bucket is created!
