# 🔧 Troubleshooting: My Requests Page & Tagging Feature

## Issues Reported
1. ❌ Not seeing requests you made
2. ❌ Tagging option not showing in request dialog

## Solutions Applied

### Fix 1: Added ownerId to RequestSeedButton
**File:** `app/library/[id]/page.tsx`
**Change:** Now passes `ownerId={seedData.owner_id}` to RequestSeedButton

**Before:**
```tsx
<RequestSeedButton seedId={id} seedName={seedData.common_name} />
```

**After:**
```tsx
<RequestSeedButton 
  seedId={id} 
  seedName={seedData.common_name}
  ownerId={seedData.owner_id}  // ✅ Now passed
/>
```

### Fix 2: Improved User Tagging UI
**File:** `components/library/request-seed-button.tsx`
**Changes:**
- ✅ Better error handling for user fetching
- ✅ Shows user count: "Found X user(s)"
- ✅ Displays profile name prominently with email
- ✅ Auto-selects seed owner when dialog opens
- ✅ Added console logging for debugging

**What you'll see now:**
```
Tag a Specific User by Profile Name (Optional)
[Dropdown showing:]
- No one (General request)
- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- ...

Found 5 user(s). Tag someone to direct this request to them specifically.
```

## Step-by-Step: Making a Request with Tagging

### 1. Apply Database Migration (IMPORTANT!)
Before the feature works, run this in Supabase SQL Editor:

```sql
-- Add tagged_user_id column
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
```

**To verify it worked:**
- Run queries from `verify-tagging-setup.sql`
- Should show column exists

### 2. Clear Browser Cache
Sometimes UI doesn't update:
```
1. Press Ctrl + Shift + Delete
2. Clear cached images and files
3. Refresh page (Ctrl + F5)
```

### 3. Check Console Logs
Open browser console (F12) when making request:
```
Should see:
✅ "Available users to tag: 5" (or similar number)
✅ "Auto-selecting owner: [uuid]" (if owner exists)

Should NOT see:
❌ "Error fetching users for tagging"
❌ Any database errors
```

### 4. Make a Test Request
1. Go to Seed Library
2. Click on any seed (not yours)
3. Click "Request Seeds" button
4. Dialog opens with:
   - Seed name (auto-filled, disabled)
   - Quantity field ✅
   - **Tag a Specific User** dropdown ✅ (NEW!)
   - Message field ✅
5. Select quantity (e.g., 10)
6. Select user from dropdown (or leave empty)
7. Click "Send Request"

## Why You're Not Seeing Your Requests

### Reason 1: No Requests Created Yet
The page correctly shows "No Requests Yet" if you haven't made any requests.

**How to create your first request:**
1. Browse Seed Library (`/library`)
2. Click on a seed you DON'T own
3. Click "Request Seeds"
4. Fill form and submit
5. Refresh My Requests page

### Reason 2: Database Issue
Check if requests are being created:

**Run in Supabase SQL Editor:**
```sql
-- Check your requests
SELECT 
    sr.*,
    s.common_name as seed_name,
    tagged.full_name as tagged_user
FROM seed_requests sr
LEFT JOIN seeds s ON sr.seed_id = s.id
LEFT JOIN profiles tagged ON sr.tagged_user_id = tagged.id
WHERE sr.requester_id = '[your_user_id]'
ORDER BY sr.created_at DESC;
```

Replace `[your_user_id]` with your actual user ID.

### Reason 3: RLS Policies
Make sure Row Level Security allows you to read your own requests:

```sql
-- Check if policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'seed_requests';

-- Should have policy like:
-- "Users can view their own sent requests"
-- Using: (auth.uid() = requester_id)
```

## Tagging Feature: How It Works

### Frontend Flow:
1. **Dialog Opens** → Fetches all users from profiles table
2. **User Selection** → Shows full_name (or email if no name)
3. **Auto-Select** → If ownerId passed, pre-selects seed owner
4. **Submit** → Saves `tagged_user_id` with request

### Database Flow:
1. Request created with optional `tagged_user_id`
2. If tagged_user_id present → Tagged user sees in "Requests Received"
3. If seed.owner_id = user → Owner sees in "Requests Received"
4. Requests combined and deduplicated on My Requests page

### Display Logic:
**Sent Requests (You made):**
- Shows: "Tagged: @Username" if you tagged someone

**Received Requests (To you):**
- Shows: "You were tagged: @Username" if tagged
- Shows: Request for your seed if you're owner
- Can be BOTH tagged AND owner

## Common Issues & Fixes

### Issue: "No users available" in dropdown
**Causes:**
- Database migration not applied
- No other users in system yet
- Profiles table empty

**Fix:**
```sql
-- Check profiles table
SELECT id, full_name, email FROM profiles LIMIT 10;

-- If empty, users need to complete signup
-- full_name comes from profile completion
```

### Issue: Dropdown shows emails instead of names
**Cause:** Users haven't set their full_name

**Fix:** Users need to complete their profile:
```
1. Go to Profile Settings
2. Fill in "Full Name"
3. Save
```

### Issue: Can't see tagged requests
**Causes:**
- Migration not applied
- Query error in receivedRequests

**Fix:**
1. Run migration from `add-tagged-user-to-requests.sql`
2. Check console for query errors
3. Verify both queries complete successfully

### Issue: Request not showing after creation
**Causes:**
- Page not refreshed
- Database error
- RLS policy blocking read

**Fix:**
```typescript
// Check console after creating request
// Should see:
"Seed request sent successfully!"

// Not:
"Error requesting seed: ..."
```

## Debug Checklist

Run through this list:

### Database Setup:
- [ ] Run `add-tagged-user-to-requests.sql` migration
- [ ] Run `verify-tagging-setup.sql` to confirm
- [ ] Column `tagged_user_id` exists in seed_requests
- [ ] Index `idx_seed_requests_tagged_user` exists

### Code Changes:
- [ ] `app/library/[id]/page.tsx` passes `ownerId`
- [ ] `components/library/request-seed-button.tsx` updated
- [ ] No TypeScript errors
- [ ] Dev server restarted

### Functionality:
- [ ] Can open "Request Seeds" dialog
- [ ] See "Tag a Specific User" dropdown
- [ ] Dropdown shows user count
- [ ] Can select users (shows profile names)
- [ ] Can create request without tagging
- [ ] Can create request with tagging
- [ ] Requests appear in "Requests I've Made"

### Display:
- [ ] Sent requests show "Tagged: @Name" badge
- [ ] Received requests show "You were tagged" badge
- [ ] Both sections have correct counts
- [ ] Images display correctly

## Test Scenario

### Complete Test Flow:

**User A (You):**
1. Go to `/library`
2. Find seed owned by User B
3. Click "Request Seeds"
4. Enter quantity: 10
5. Select User C from "Tag a User" dropdown
6. Enter message: "Need these seeds for spring planting"
7. Submit request

**Expected Results:**
- User A sees request in "Requests I've Made" with "Tagged: @User C"
- User B sees request in "Requests I've Received" (as owner)
- User C sees request in "Requests I've Received" with "You were tagged"
- Request appears once for User B even though they're owner
- Request appears once for User C even though they're tagged

## Files to Check

### Modified Files:
1. `app/library/[id]/page.tsx` - Passes ownerId
2. `components/library/request-seed-button.tsx` - Tagging UI
3. `app/library/requests/page.tsx` - Display logic

### SQL Files:
1. `add-tagged-user-to-requests.sql` - Migration
2. `verify-tagging-setup.sql` - Verification queries

### Documentation:
1. `TAGGING_FEATURE_COMPLETE.md` - Full docs
2. `TROUBLESHOOTING_REQUESTS.md` - This file
3. `QUICK_FIX_SUMMARY.md` - Quick reference

## Still Not Working?

### Check Browser Console:
```
F12 → Console Tab
Look for:
- "Available users to tag: X"
- "Auto-selecting owner: [uuid]"
- Any red errors
```

### Check Network Tab:
```
F12 → Network Tab → Filter: Fetch/XHR
When opening dialog, should see:
- Request to /auth/v1/user (get current user)
- Request to /rest/v1/profiles (fetch users)
Both should return 200 OK
```

### Check Supabase Logs:
```
Supabase Dashboard → Logs → Postgres Logs
Look for any errors related to:
- seed_requests table
- profiles table
- tagged_user_id column
```

## Success Indicators

You'll know it's working when:
- ✅ "Tag a Specific User" dropdown shows in request dialog
- ✅ Dropdown shows "Found X user(s)"
- ✅ Can see profile names in dropdown
- ✅ Seed owner is auto-selected
- ✅ Can create request with/without tagging
- ✅ Requests appear in My Requests page
- ✅ Tagged user badges show correctly

## Summary

**Core Issues Fixed:**
1. ✅ ownerId now passed to RequestSeedButton
2. ✅ Better UI for user selection by profile name
3. ✅ Added debugging logs
4. ✅ Improved error handling

**Required Actions:**
1. Run database migration (if not done)
2. Restart dev server
3. Clear browser cache
4. Test creating a request

The tagging feature should now be fully visible and functional! 🎉
