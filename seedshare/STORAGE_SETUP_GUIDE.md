# 🔧 SUPABASE STORAGE SETUP GUIDE

## Issue: "Bucket not found" Error

The QR code generation is failing because the storage buckets don't exist in your Supabase project yet.

## Quick Fix Steps

### Step 1: Create Storage Buckets in Supabase Dashboard

1. Go to your Supabase Dashboard: https://robnrtjlgzohlpkljyzy.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**

Create these buckets (one by one):

#### Bucket 1: qr-codes
- **Name**: `qr-codes`
- **Public bucket**: ✅ **YES** (check this box)
- **File size limit**: 1 MB
- **Allowed MIME types**: Leave empty (allow all)
- Click **"Create bucket"**

#### Bucket 2: seed-images
- **Name**: `seed-images`
- **Public bucket**: ✅ **YES**
- **File size limit**: 5 MB
- Click **"Create bucket"**

#### Bucket 3: avatars
- **Name**: `avatars`
- **Public bucket**: ✅ **YES**
- **File size limit**: 2 MB
- Click **"Create bucket"**

#### Bucket 4: product-images
- **Name**: `product-images`
- **Public bucket**: ✅ **YES**
- **File size limit**: 5 MB
- Click **"Create bucket"**

#### Bucket 5: community-images
- **Name**: `community-images`
- **Public bucket**: ✅ **YES**
- **File size limit**: 5 MB
- Click **"Create bucket"**

### Step 2: Set Up Storage Policies (Optional but Recommended)

After creating the buckets, you can add RLS policies for better security:

1. In Supabase Dashboard, go to **Storage** → Click on a bucket (e.g., `qr-codes`)
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Use the SQL from `supabase-storage-setup.sql` file

OR

Run the SQL file in the **SQL Editor**:
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase-storage-setup.sql`
3. Paste and click **"Run"**

### Step 3: Verify Setup

Run this query in the SQL Editor to verify buckets were created:

```sql
SELECT id, name, public, created_at 
FROM storage.buckets 
ORDER BY created_at DESC;
```

You should see all 5 buckets listed.

### Step 4: Test the Application

1. Restart your dev server (if running)
2. Try adding a new seed
3. QR code should now generate and upload successfully!

## What Changed in the Code

I've updated the code to handle missing buckets gracefully:

- ✅ If `qr-codes` bucket doesn't exist, QR code will be stored as a data URL (base64)
- ✅ Seed will still be created successfully
- ✅ Warning messages in console instead of errors
- ✅ Application won't crash

However, **I strongly recommend creating the buckets** for:
- Better performance (smaller database records)
- Proper CDN delivery
- Easier sharing of QR codes
- Future scalability

## Alternative: Disable QR Code Generation

If you want to skip QR codes for now, you can comment out this section in `app/library/add/page.tsx`:

```typescript
// Temporarily disable QR generation
/*
try {
  await createSeedQRCode(supabase, (seed as any).id, {
    common_name: seedData.common_name,
    variety: seedData.variety,
    owner_id: user.id,
  });
} catch (qrError) {
  console.error('Failed to generate QR code:', qrError);
}
*/
```

## Bucket Configuration Summary

| Bucket Name       | Public | Size Limit | Used For                    |
|-------------------|--------|------------|-----------------------------|
| qr-codes          | Yes    | 1 MB       | Seed QR codes               |
| seed-images       | Yes    | 5 MB       | Seed photos                 |
| avatars           | Yes    | 2 MB       | User profile pictures       |
| product-images    | Yes    | 5 MB       | Marketplace product photos  |
| community-images  | Yes    | 5 MB       | Community posts/groups      |

## Troubleshooting

### Error: "Bucket not found"
- **Solution**: Create the `qr-codes` bucket in Supabase Dashboard (see Step 1)

### Error: "Failed to upload QR code"
- **Solution**: Check if bucket exists and is public
- Verify Supabase URL and anon key in `.env.local`

### QR code shows as long text in database
- **Normal**: This means data URL fallback is working
- **Fix**: Create storage buckets to use proper URLs

### Cannot view QR code image
- **Solution**: Make sure bucket is set to **Public**
- Check bucket policies allow public read access

## Next Steps

1. ✅ Create all 5 storage buckets
2. ✅ Test adding a seed with QR code
3. ✅ Test uploading seed images (coming soon)
4. ✅ Test avatar upload (coming soon)

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify Supabase project URL is correct
3. Make sure you're logged in when adding seeds
4. Check Supabase Dashboard → Storage → Buckets exist

---

**Status**: Code updated to handle missing buckets gracefully
**Action Required**: Create storage buckets in Supabase Dashboard
**Priority**: High (for QR code feature to work properly)
