# Storage Buckets Setup - Step by Step

## 🎯 What You Need to Do

Follow these exact steps to fix the storage RLS error.

---

## 📦 Part 1: Create Storage Buckets (2 minutes)

### Step-by-Step Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your SeedShare project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - You'll see the Storage page

3. **Create First Bucket: qr-codes**
   - Click **"New Bucket"** button (green button, top right)
   - Fill in:
     - **Name:** `qr-codes` (exactly, no spaces)
     - **Public bucket:** ✅ CHECK THIS BOX
     - **File size limit:** 2097152 (2 MB)
     - **Allowed MIME types:** `image/png,image/jpeg,image/webp`
   - Click **"Create bucket"**

4. **Create Second Bucket: seed-images**
   - Click **"New Bucket"** again
   - Fill in:
     - **Name:** `seed-images`
     - **Public bucket:** ✅ CHECK THIS BOX
     - **File size limit:** 5242880 (5 MB)
     - **Allowed MIME types:** `image/png,image/jpeg,image/webp,image/gif`
   - Click **"Create bucket"**

5. **Create Third Bucket: product-images**
   - Click **"New Bucket"**
   - Fill in:
     - **Name:** `product-images`
     - **Public bucket:** ✅ CHECK THIS BOX
     - **File size limit:** 5242880 (5 MB)
     - **Allowed MIME types:** `image/png,image/jpeg,image/webp,image/gif`
   - Click **"Create bucket"**

6. **Create Fourth Bucket: avatars**
   - Click **"New Bucket"**
   - Fill in:
     - **Name:** `avatars`
     - **Public bucket:** ✅ CHECK THIS BOX
     - **File size limit:** 2097152 (2 MB)
     - **Allowed MIME types:** `image/png,image/jpeg,image/webp`
   - Click **"Create bucket"**

7. **Create Fifth Bucket: community-images**
   - Click **"New Bucket"**
   - Fill in:
     - **Name:** `community-images`
     - **Public bucket:** ✅ CHECK THIS BOX
     - **File size limit:** 5242880 (5 MB)
     - **Allowed MIME types:** `image/png,image/jpeg,image/webp,image/gif`
   - Click **"Create bucket"**

### ✅ Verification

After creating all buckets, you should see 5 buckets listed:
- qr-codes (Public)
- seed-images (Public)
- product-images (Public)
- avatars (Public)
- community-images (Public)

**Important:** All should show "Public" badge!

---

## 🔧 Part 2: Apply RLS Policies (1 minute)

### Step-by-Step Instructions:

1. **Navigate to SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

2. **Copy the SQL Script**
   - Open the file: `fix-storage-rls-policies.sql`
   - Select ALL text (Ctrl+A or Cmd+A)
   - Copy (Ctrl+C or Cmd+C)

3. **Paste and Run**
   - Go back to Supabase SQL Editor
   - Paste the script (Ctrl+V or Cmd+V)
   - Click **"Run"** button (or press Ctrl+Enter)

4. **Wait for Success**
   - You'll see a progress indicator
   - Wait for "Success. No rows returned" message
   - You should see the success message in the output

5. **Verify Policies**
   - Scroll down in the output
   - You should see a list of all created policies
   - Look for the summary message showing 21 policies

### ✅ Verification

Run this verification query:

```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

Should return: **20** (4 policies × 5 buckets)

---

## 🧪 Part 3: Test File Upload (1 minute)

### Quick Test:

1. **Login to your app** (http://localhost:3000)

2. **Go to Profile Settings**
   - Click your avatar/profile icon
   - Click "Settings" or "Profile"

3. **Try to Upload Avatar**
   - Click "Upload Avatar" or "Change Photo"
   - Select any image file
   - Click "Save" or "Upload"

4. **Check for Errors**
   - Open browser console (F12)
   - Check "Console" tab
   - Should see no "StorageApiError"

### ✅ Success Indicators

If it works:
- ✅ Image uploads without errors
- ✅ Image displays in profile
- ✅ No red errors in console
- ✅ Success message appears

If it fails:
- ❌ "StorageApiError" in console
- ❌ "new row violates row-level security policy"
- ❌ Image doesn't appear

**If it fails, go to Part 4 below.**

---

## 🔍 Part 4: Troubleshooting

### Issue 1: "Bucket not found"

**Solution:**
1. Go to Storage in Supabase Dashboard
2. Verify all 5 buckets exist
3. Check spelling is exact (no typos)
4. Bucket names should be:
   - `qr-codes` (NOT qr_codes or qrcodes)
   - `seed-images` (NOT seed_images)
   - `product-images` (NOT product_images)
   - `avatars`
   - `community-images` (NOT community_images)

### Issue 2: "Access denied" or RLS error persists

**Solution:**
1. Go to Storage → Click bucket name
2. Click **"Policies"** tab
3. Verify you see 4 policies per bucket:
   - `{bucket}_select_policy`
   - `{bucket}_insert_policy`
   - `{bucket}_update_policy`
   - `{bucket}_delete_policy`
4. If missing, re-run the SQL script

### Issue 3: Bucket is Private (not Public)

**Solution:**
1. Go to Storage in Dashboard
2. Find the bucket
3. Click the **⚙️ Settings** icon next to bucket name
4. Check **"Public bucket"** checkbox
5. Click **"Save"**
6. Repeat for all 5 buckets

### Issue 4: Still getting errors

**Last Resort Fix:**

1. **Delete all buckets:**
   - Go to Storage
   - For each bucket, click ⚙️ → Delete
   - Confirm deletion

2. **Re-create buckets:**
   - Follow Part 1 again
   - Make sure to check "Public bucket"

3. **Re-run SQL script:**
   - Follow Part 2 again
   - Wait for success message

4. **Test again:**
   - Follow Part 3 again

---

## 📋 Complete Checklist

Before you say "it's not working":

- [ ] All 5 buckets created in Supabase Dashboard
- [ ] All 5 buckets have "Public" badge visible
- [ ] SQL script ran without errors
- [ ] Verification query shows 20 policies
- [ ] User is logged in to the app
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Tried uploading a small test image (< 1MB)
- [ ] Checked browser console for error messages
- [ ] Bucket names spelled exactly correct (with hyphens)

---

## 🎯 Quick Reference

### Bucket Names (Copy-Paste Ready)
```
qr-codes
seed-images
product-images
avatars
community-images
```

### File Size Limits (bytes)
```
qr-codes: 2097152 (2 MB)
seed-images: 5242880 (5 MB)
product-images: 5242880 (5 MB)
avatars: 2097152 (2 MB)
community-images: 5242880 (5 MB)
```

### Allowed MIME Types
```
Small images (QR, avatars):
image/png,image/jpeg,image/webp

Large images (seeds, products, community):
image/png,image/jpeg,image/webp,image/gif
```

---

## 🚀 After Setup is Complete

You can now:
- ✅ Upload avatar images
- ✅ Upload seed images (multiple per seed)
- ✅ Upload product images (marketplace)
- ✅ Upload community event images
- ✅ Generate and store QR codes
- ✅ All images publicly accessible via CDN

---

## 💾 Backup Your Work

After successful setup, save this for reference:

1. **Bucket URLs** (find in Storage → Bucket → Click file):
   ```
   https://[your-project-id].supabase.co/storage/v1/object/public/qr-codes/
   https://[your-project-id].supabase.co/storage/v1/object/public/seed-images/
   https://[your-project-id].supabase.co/storage/v1/object/public/product-images/
   https://[your-project-id].supabase.co/storage/v1/object/public/avatars/
   https://[your-project-id].supabase.co/storage/v1/object/public/community-images/
   ```

2. **Policy Count**: 20 storage policies + 1 bucket policy = 21 total

3. **Created Date**: October 14, 2025

---

**Done! Your storage setup is complete.** 🎉

The "new row violates row-level security policy" error should now be resolved.
