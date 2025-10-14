# Seed Image Classification - Troubleshooting

## ❌ Error: "Failed to analyze seed image"

This is a generic error. Follow these steps to find the actual issue:

### Step 1: Check Browser Console

Open browser DevTools (F12) and look for the actual error message. The console will show details like:
- `Analysis API error: { error: "...", details: "..." }`

Common errors you might see:

---

## 🔍 Common Issues & Solutions

### Issue 1: "Unauthorized"

**Cause:** User not logged in or session expired

**Solution:**
1. Log out and log back in
2. Check if `await supabase.auth.getUser()` is working
3. Verify cookies are enabled
4. Clear browser cache and try again

---

### Issue 2: "Failed to upload image"

**Cause:** Storage bucket not configured or RLS policies missing

**Solution:**

1. **Check if bucket exists:**
   - Go to Supabase Dashboard → Storage
   - Look for `seed-images` bucket
   
2. **If bucket doesn't exist, create it:**
   - Click "New bucket"
   - Name: `seed-images`
   - Public: ✅ Yes
   - File size limit: 5242880 (5MB)
   - Allowed MIME types: `image/*`

3. **Fix RLS policies:**
   ```sql
   -- Run in Supabase SQL Editor
   -- Allow public SELECT
   CREATE POLICY "Public can view seed images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'seed-images');

   -- Allow authenticated users to INSERT
   CREATE POLICY "Authenticated users can upload seed images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'seed-images');

   -- Allow users to UPDATE their own files
   CREATE POLICY "Users can update their own seed images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'seed-images' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to DELETE their own files
   CREATE POLICY "Users can delete their own seed images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'seed-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

4. **Or run the fix script:**
   ```sql
   -- Run: simple-storage-rls-fix.sql
   ```

---

### Issue 3: "Failed to save analysis" (in console)

**Cause:** Database table doesn't exist

**Solution:**

1. **Run the schema:**
   - Open Supabase SQL Editor
   - Copy contents of `supabase-seed-analysis-schema.sql`
   - Paste and execute
   - Look for success message

2. **Verify table exists:**
   ```sql
   SELECT * FROM seed_image_analysis LIMIT 1;
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'seed_image_analysis';
   ```
   Should show 3 policies (SELECT, INSERT, DELETE)

---

### Issue 4: "Failed to parse analysis results"

**Cause:** Gemini API returned unexpected format

**Possible reasons:**
- API key invalid
- API quota exceeded
- Model returned text instead of JSON

**Solution:**

1. **Check API key:**
   ```env
   # In .env.local
   OPENAI_API_KEY=your_actual_gemini_api_key
   ```

2. **Verify API key works:**
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)
   - Check if key is active
   - Verify you have Gemini 1.5 Flash access

3. **Check API quota:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Check Generative AI API usage
   - Verify you haven't exceeded free tier limits

4. **Check console logs:**
   - Look for `Failed to parse AI response:` in server logs
   - This will show what the AI actually returned

---

### Issue 5: "Invalid file type"

**Cause:** Trying to upload non-image file

**Solution:**
- Only upload: JPEG, PNG, WebP, GIF
- File must have `image/*` MIME type
- Check file extension is correct

---

### Issue 6: "Image size should be less than 5MB"

**Cause:** Image file too large

**Solution:**
- Compress image before uploading
- Use tools like TinyPNG, Squoosh
- Or take photo with lower resolution

---

### Issue 7: TypeScript Errors in IDE

**Error:**
```
Type 'never' is not assignable to type...
Property 'id' does not exist on type 'never'
```

**Cause:** Table doesn't exist in Supabase types yet

**Solution:**
1. Run `supabase-seed-analysis-schema.sql` first
2. Generate new types:
   ```bash
   pnpm supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
   ```
3. Restart TypeScript server in VS Code

---

## 🔧 Verification Checklist

Run this checklist to ensure everything is set up:

### Database
- [ ] `seed_image_analysis` table exists
- [ ] Table has 10 columns (id, user_id, image_url, etc.)
- [ ] RLS is enabled on table
- [ ] 3 RLS policies exist (SELECT, INSERT, DELETE)

### Storage
- [ ] `seed-images` bucket exists
- [ ] Bucket is public
- [ ] Bucket allows image/* MIME types
- [ ] File size limit is 5MB
- [ ] 4 storage policies exist

### API Configuration
- [ ] `.env.local` has `OPENAI_API_KEY`
- [ ] API key is valid Gemini key (not OpenAI)
- [ ] API endpoint `/api/analyze-seed` exists
- [ ] Gemini 1.5 Flash model accessible

### Frontend
- [ ] Camera icon visible in chatbot
- [ ] File input accepts images
- [ ] Image preview shows after selection
- [ ] Can remove image with X button

---

## 🧪 Test Commands

### 1. Verify Setup
```sql
-- Run in Supabase SQL Editor
\i verify-seed-analysis-setup.sql
```

### 2. Test Image Upload (Manual)
1. Go to Supabase Dashboard → Storage → seed-images
2. Try uploading an image manually
3. If fails, check bucket policies

### 3. Test Database Insert (Manual)
```sql
-- Run in Supabase SQL Editor (replace YOUR_USER_ID)
INSERT INTO seed_image_analysis (
  user_id,
  image_url,
  seed_condition,
  confidence_score,
  analysis_result
) VALUES (
  'YOUR_USER_ID',
  'https://example.com/test.jpg',
  'healthy',
  0.95,
  '{"test": true}'::jsonb
);
```

### 4. Check Server Logs
```bash
# In VS Code terminal
# Look for errors when you try to upload
pnpm run dev
```

---

## 📊 Debugging Steps

### Step-by-Step Debugging:

1. **Open browser DevTools (F12)**
   - Go to Console tab
   - Clear console
   - Try uploading image
   - Look for red error messages

2. **Check Network tab:**
   - Filter by `analyze-seed`
   - Look at request payload
   - Look at response
   - Check status code (should be 200)

3. **Check VS Code terminal:**
   - Look for server-side errors
   - Check for "Upload error:", "Failed to parse", etc.

4. **Test API directly:**
   ```bash
   # Using curl (replace with your auth token)
   curl -X POST http://localhost:3000/api/analyze-seed \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@path/to/seed.jpg" \
     -F "context=Test upload"
   ```

---

## 🎯 Quick Fixes

### Quick Fix 1: Reset Everything
```sql
-- Drop and recreate table
DROP TABLE IF EXISTS seed_image_analysis CASCADE;

-- Then run:
\i supabase-seed-analysis-schema.sql
```

### Quick Fix 2: Reset Storage
```sql
-- Delete all policies
DROP POLICY IF EXISTS "Public can view seed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload seed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own seed images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own seed images" ON storage.objects;

-- Then run:
\i simple-storage-rls-fix.sql
```

### Quick Fix 3: Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
pnpm run dev
```

---

## 🆘 Still Not Working?

If you've tried everything above:

1. **Check Supabase status:**
   - Visit [status.supabase.com](https://status.supabase.com)

2. **Verify project billing:**
   - Free tier has limits on API calls
   - Check if you've exceeded quota

3. **Review full error:**
   - Copy full error from console
   - Copy full error from server logs
   - Check for any error codes

4. **Test with simple image:**
   - Try with very small image (< 500KB)
   - Try with different image format (PNG vs JPEG)

5. **Check file permissions:**
   - Ensure uploaded file is readable
   - Check file isn't corrupted

---

## 📞 Getting Help

When asking for help, include:

1. **Error message from console** (with details)
2. **Network response** (from DevTools Network tab)
3. **Server logs** (from terminal)
4. **Setup verification results** (from verify-seed-analysis-setup.sql)
5. **What you've already tried**

This will help diagnose the issue faster! 🚀
