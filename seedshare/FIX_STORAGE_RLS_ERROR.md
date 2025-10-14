# Fix Storage RLS Error - Quick Guide

## 🚨 Error
```
StorageApiError: new row violates row-level security policy
```

This error occurs when trying to upload files to Supabase Storage without proper RLS policies.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Create Storage Buckets in Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New Bucket"** and create these 5 buckets:

| Bucket Name | Public | File Size Limit | Allowed MIME Types |
|-------------|--------|-----------------|-------------------|
| `qr-codes` | ✅ Yes | 2 MB | image/* |
| `seed-images` | ✅ Yes | 5 MB | image/* |
| `product-images` | ✅ Yes | 5 MB | image/* |
| `avatars` | ✅ Yes | 2 MB | image/* |
| `community-images` | ✅ Yes | 5 MB | image/* |

**Important:** Make sure to check **"Public bucket"** for all buckets!

### Step 2: Run SQL Script to Fix RLS Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy the entire contents of `fix-storage-rls-policies.sql`
4. Paste and click **Run**
5. Wait for success message

### Step 3: Verify Buckets are Public

1. Go back to **Storage** in Supabase Dashboard
2. For each bucket, click the **settings icon** (⚙️)
3. Verify **"Public bucket"** is checked
4. If not, check it and click **Save**

---

## 🎯 What the SQL Script Does

The script creates 21 RLS policies:

### For Each Bucket (5 buckets × 4 policies = 20)
- ✅ **SELECT** - Everyone can view files (public access)
- ✅ **INSERT** - Authenticated users can upload files
- ✅ **UPDATE** - Users can update their own files
- ✅ **DELETE** - Users can delete their own files

### For Buckets Table (1 policy)
- ✅ **SELECT** - Everyone can view bucket list

---

## 🧪 Test the Fix

After running the script, test file upload:

### Test 1: Upload Avatar
1. Login to your app
2. Go to Profile Settings
3. Click "Upload Avatar"
4. Select an image
5. Should upload successfully ✅

### Test 2: Upload Seed Image
1. Go to Seed Library
2. Click "Add New Seed"
3. Upload seed images
4. Should work without errors ✅

### Test 3: Upload Product Image
1. Go to Marketplace
2. Create a new product listing
3. Upload product image
4. Should upload successfully ✅

---

## 🔍 Verify RLS Policies are Applied

Run this query in SQL Editor to check:

```sql
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
```

You should see **20 policies** listed (4 per bucket).

---

## 🐛 Still Getting Errors?

### Error: "Bucket not found"
**Solution:** Make sure all 5 buckets are created in Supabase Dashboard

### Error: "Access denied"
**Solution:** 
1. Check that buckets are set to **Public**
2. Re-run the SQL script
3. Make sure you're logged in

### Error: "File too large"
**Solution:** 
1. Go to Storage → Bucket Settings
2. Increase **File Size Limit**
3. For seed/product images: set to 5 MB
4. For avatars/QR: set to 2 MB

### Error: "Invalid MIME type"
**Solution:**
1. Go to Storage → Bucket Settings
2. Set **Allowed MIME types** to: `image/*`
3. Or specify: `image/jpeg,image/png,image/webp,image/gif`

---

## 📋 Checklist

Before testing, verify:

- [ ] All 5 buckets created in Supabase Dashboard
- [ ] All buckets set to **Public**
- [ ] SQL script `fix-storage-rls-policies.sql` executed successfully
- [ ] No errors in SQL Editor after running script
- [ ] User is logged in (authenticated)
- [ ] Browser console shows no RLS errors

---

## 🎉 Success!

After following these steps:
- ✅ File uploads work without RLS errors
- ✅ Images display correctly in the app
- ✅ Users can upload/update/delete their own files
- ✅ Public access to view all uploaded images

---

## 📚 Additional Info

### Why This Error Happens

Supabase Storage uses Row-Level Security (RLS) just like database tables. By default:
- ❌ No policies = No access
- ❌ RLS enabled but no INSERT policy = Upload fails

### What We Fixed

1. **Enabled RLS** on `storage.objects` table
2. **Created INSERT policies** for authenticated users
3. **Created SELECT policies** for public viewing
4. **Created UPDATE/DELETE policies** for file owners

### Security Benefits

- ✅ Only authenticated users can upload
- ✅ Users can only modify their own files
- ✅ Everyone can view public images
- ✅ Protection against unauthorized access

---

## 🔗 Related Files

- `fix-storage-rls-policies.sql` - SQL script to fix policies
- `supabase-storage-setup.sql` - Original storage setup (if exists)
- `STORAGE_SETUP_GUIDE.md` - Detailed storage documentation (if exists)

---

## 💡 Pro Tips

1. **Always use Public buckets** for user-generated content (images, avatars)
2. **Set reasonable file size limits** to prevent abuse
3. **Use authenticated policies** for INSERT/UPDATE/DELETE
4. **Test uploads immediately** after applying policies
5. **Check browser console** for detailed error messages

---

**The storage RLS error should now be fixed!** 🚀

If you still encounter issues, check the browser console for detailed error messages and verify all buckets are created correctly.
