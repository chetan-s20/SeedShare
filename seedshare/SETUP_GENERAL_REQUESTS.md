# ✅ Quick Setup: General Requests Feature

## What You Need to Do

### Step 1: Apply Database Migration ⚠️ REQUIRED!

**Open Supabase SQL Editor and run:**

```sql
-- Allow NULL seed_id for general requests
ALTER TABLE seed_requests 
ALTER COLUMN seed_id DROP NOT NULL;

-- Add tagged user column
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
CREATE INDEX IF NOT EXISTS idx_seed_requests_seed_id_null ON seed_requests(seed_id) WHERE seed_id IS NULL;

-- Ensure general requests have a tagged user
ALTER TABLE seed_requests 
ADD CONSTRAINT check_general_request_has_tag 
CHECK (
  (seed_id IS NOT NULL) OR 
  (seed_id IS NULL AND tagged_user_id IS NOT NULL)
);
```

### Step 2: Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
cd C:\Users\Admin\Desktop\SeedShare-1\seedshare
npx next dev --turbopack
```

### Step 3: Test the Feature

1. Go to: `http://localhost:3000/library/requests`
2. If no requests, you'll see: **"No Requests Made"**
3. Click: **"Create New Request"** button
4. Fill form:
   - What seeds: "Organic tomatoes"
   - Quantity: 10 (optional)
   - Tag a user: Select from dropdown
   - Message: Explain what you need
5. Click: **"Send Request"**
6. ✅ Request appears in "Requests I've Made"

## What Changed

### UI Updates:
- ✅ "Browse Seeds" button → "Create New Request" button
- ✅ New form dialog for creating general requests
- ✅ Tag users by profile name
- ✅ Show "General Seed Request" for requests without specific seed
- ✅ Show "Community Request" badge

### Database:
- ✅ `seed_id` now nullable (can be NULL)
- ✅ `tagged_user_id` column added
- ✅ Constraint: General requests MUST have tagged user

### Behavior:
- ✅ Everything syncs with database in real-time
- ✅ "No requests" states updated
- ✅ Handles both specific seed requests and general requests

## Expected Results

### Before Creating Requests:
```
┌─────────────────────────────────────┐
│ 📦 No Requests Made                 │
│                                      │
│ You haven't made any seed requests  │
│ yet. Create a request and tag a     │
│ community member who might help.    │
│                                      │
│    [Create New Request]              │
└─────────────────────────────────────┘
```

### After Creating Request:
```
┌─────────────────────────────────────┐
│ 🌱 General Seed Request             │
│    Community Request                 │
│    pending                           │
│                                      │
│ Tagged: @Jane Smith                  │
│ Requested: Oct 14, 2025              │
│                                      │
│ Message: Looking for organic...      │
│                                      │
│ [View Details]                       │
└─────────────────────────────────────┘
```

## Troubleshooting

### ❌ Error: "seed_id cannot be null"
**Solution:** Run the database migration above

### ❌ No users in "Tag a User" dropdown
**Solution:** 
- Make sure other users exist in your database
- Check profiles table: `SELECT * FROM profiles;`

### ❌ Button not showing
**Solution:**
- Hard refresh: Ctrl + F5
- Clear browser cache
- Restart dev server

## Files Created/Modified

### New Files:
- `components/library/create-general-request-dialog.tsx` ✅
- `update-seed-requests-for-general.sql` ✅
- `GENERAL_REQUESTS_FEATURE.md` ✅

### Modified Files:
- `app/library/requests/page.tsx` ✅

## Verification

After setup, verify everything works:

```sql
-- 1. Check column exists and is nullable
SELECT column_name, is_nullable 
FROM information_schema.columns
WHERE table_name = 'seed_requests' AND column_name = 'seed_id';
-- Should show: is_nullable = 'YES'

-- 2. Check constraint exists
SELECT conname 
FROM pg_constraint
WHERE conrelid = 'seed_requests'::regclass 
  AND conname = 'check_general_request_has_tag';
-- Should return one row

-- 3. Test creating a general request (UI)
-- Go to /library/requests → Create New Request → Submit
-- Then query:
SELECT * FROM seed_requests WHERE seed_id IS NULL;
-- Should show your general request
```

## Success! 🎉

The feature is ready when:
- ✅ "Create New Request" button shows on empty state
- ✅ Dialog opens with form
- ✅ Can select users from dropdown
- ✅ Can create request successfully
- ✅ Request appears in "Requests I've Made"
- ✅ Shows "General Seed Request" and "Community Request"

Everything syncs with your Supabase database automatically!
