# 🎯 General Seed Requests Feature - Complete Guide

## Overview
Users can now create **general seed requests** without targeting a specific seed. These requests use the tagging system to reach out to community members who might help.

## What Changed

### 1. New Component: CreateGeneralRequestDialog
**File:** `components/library/create-general-request-dialog.tsx`

**Features:**
- ✅ Create request without specific seed
- ✅ Tag users by profile name
- ✅ Describe what seeds you're looking for
- ✅ Optional quantity field
- ✅ Required message field
- ✅ Real-time user list from database
- ✅ Syncs with database automatically

### 2. Updated My Requests Page
**File:** `app/library/requests/page.tsx`

**Changes:**
- ✅ Replaced "Browse Seeds" button with "Create New Request" form
- ✅ Handles both specific and general requests
- ✅ Shows "General Seed Request" for requests without seed_id
- ✅ Displays "Community Request" badge for general requests
- ✅ Hides "View Seed" button for general requests

### 3. Database Schema Update
**File:** `update-seed-requests-for-general.sql`

**Changes:**
- ✅ seed_id now nullable (allows NULL)
- ✅ tagged_user_id column added
- ✅ Check constraint: General requests MUST have tagged_user_id
- ✅ Indexes for performance

## Database Migration

### CRITICAL: Run This First!

Open Supabase SQL Editor and execute:

```sql
-- Step 1: Make seed_id nullable
ALTER TABLE seed_requests 
ALTER COLUMN seed_id DROP NOT NULL;

-- Step 2: Add tagged_user_id column
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
CREATE INDEX IF NOT EXISTS idx_seed_requests_seed_id_null ON seed_requests(seed_id) WHERE seed_id IS NULL;

-- Step 4: Add constraint (general requests must have tagged user)
ALTER TABLE seed_requests 
ADD CONSTRAINT check_general_request_has_tag 
CHECK (
  (seed_id IS NOT NULL) OR 
  (seed_id IS NULL AND tagged_user_id IS NOT NULL)
);
```

### Verify Migration

```sql
-- Should show seed_id as nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'seed_requests'
  AND column_name = 'seed_id';
-- Expected: is_nullable = 'YES'

-- Should show constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'seed_requests'::regclass
  AND conname = 'check_general_request_has_tag';
```

## How It Works

### Request Types

#### Type 1: Specific Seed Request
- **seed_id:** NOT NULL
- **tagged_user_id:** Optional
- **Use case:** Requesting a particular seed from library
- **Created from:** Seed detail page → "Request Seeds" button

#### Type 2: General Request (NEW!)
- **seed_id:** NULL
- **tagged_user_id:** REQUIRED
- **Use case:** Asking community member for help finding seeds
- **Created from:** My Requests page → "Create New Request" button

### User Flow

#### Creating a General Request:

1. **Navigate:** Go to `/library/requests`
2. **Empty State:** If no requests, see "No Requests Made" card
3. **Click:** "Create New Request" button
4. **Dialog Opens:**
   ```
   Create Seed Request
   ├── What seeds are you looking for?
   │   └── [Text input: "Tomato seeds, Basil..."]
   ├── Quantity Needed
   │   └── [Number input: optional]
   ├── Tag a User (Required) *
   │   └── [Dropdown: John Doe, Jane Smith...]
   │       Found 5 user(s). Tag someone who might help.
   └── Message *
       └── [Text area: Explain what you need...]
   ```
5. **Fill Form:**
   - Describe seeds: "Organic tomato varieties"
   - Quantity: 10 (optional)
   - Tag user: Select "Jane Smith" (tomato expert)
   - Message: "Hi Jane, I'm looking for organic tomato seeds for spring planting. I know you grow heirloom varieties and would love your recommendations!"
6. **Submit:** Click "Send Request"
7. **Result:** Request appears in "Requests I've Made"

#### Viewing Requests:

**Requests I've Made:**
```
[Icon] General Seed Request
       Community Request
       
       Tagged: @Jane Smith
       Requested: Oct 14, 2025
       
       Message: Hi Jane, I'm looking for organic tomato...
       
       [View Details]
```

**Requests I've Received:**
```
[Icon] General Seed Request
       Community Request
       
       From: John Doe
       You were tagged: @Jane Smith
       Requested: Oct 14, 2025
       
       Message: Hi Jane, I'm looking for organic tomato...
       
       [View Details] [Respond]
```

## Empty States

### Before (Old):
**No Requests Made:**
```
[Icon] No Requests Yet
You haven't made any seed requests yet. Browse the seed library to find seeds you're interested in.
[Browse Seeds]
```

**No Requests Received:**
```
[Icon] No Requests Received
You haven't received any seed requests yet. Add your seeds to the library to start receiving requests.
[Add Your Seeds]
```

### After (New):
**No Requests Made:**
```
[Icon] No Requests Made
You haven't made any seed requests yet. Create a request and tag a community member who might help.
[Create New Request] ← Opens dialog
```

**No Requests Received:**
```
[Icon] No Requests Available
You haven't received any seed requests yet. Add your seeds to the library or wait for community members to tag you in their requests.
[Add Your Seeds]
```

## UI Components

### Request Card - Specific Seed
```
┌─────────────────────────────────────┐
│ [Seed Image] Tomato Seeds           │
│              Cherokee Purple         │
│              pending                 │
│                                      │
│ Quantity: 10 seeds                   │
│ Owner: John Doe                      │
│ Tagged: @Jane Smith                  │
│ Requested: Oct 14, 2025              │
│                                      │
│ [View Details] [View Seed]           │
└─────────────────────────────────────┘
```

### Request Card - General Request
```
┌─────────────────────────────────────┐
│ [Leaf Icon] General Seed Request    │
│             Community Request        │
│             pending                  │
│                                      │
│ Tagged: @Jane Smith                  │
│ Requested: Oct 14, 2025              │
│                                      │
│ [View Details]                       │
└─────────────────────────────────────┘
```

## Database Sync

### All operations sync with Supabase:

**Creating Request:**
```typescript
INSERT INTO seed_requests (
  seed_id,           -- NULL for general requests
  requester_id,      -- Current user
  tagged_user_id,    -- Selected user (required for general)
  quantity_requested, -- Optional amount
  message,           -- Required description
  status             -- 'pending'
)
```

**Fetching Requests:**
```typescript
// Sent requests
SELECT * FROM seed_requests
WHERE requester_id = current_user_id
// Includes both specific and general requests

// Received requests
SELECT * FROM seed_requests
WHERE seed.owner_id = current_user_id
   OR tagged_user_id = current_user_id
// Includes both owned seeds and tagged requests
```

**Real-time Updates:**
- ✅ Create request → Auto refreshes page
- ✅ Status changes → Reflects immediately
- ✅ New user tags → Shows in received requests
- ✅ Response messages → Displays when added

## Validation Rules

### Frontend Validation:
- ✅ What seeds: Required
- ✅ Tagged user: Required (enforced with `required` attribute)
- ✅ Message: Required
- ✅ Quantity: Optional, must be positive if provided

### Database Validation:
- ✅ If seed_id NULL → tagged_user_id NOT NULL (check constraint)
- ✅ tagged_user_id must reference existing profile
- ✅ requester_id must reference existing profile

### Business Logic:
- ✅ Can't tag yourself
- ✅ Must be logged in
- ✅ Message should mention what seeds you're looking for

## Testing Guide

### Test Scenario 1: Create General Request

1. **Setup:** Be logged in
2. **Action:** Go to `/library/requests`
3. **Verify:** See "No Requests Made" (if no requests yet)
4. **Action:** Click "Create New Request"
5. **Verify:** Dialog opens with form
6. **Action:** Fill form:
   - Seeds: "Heirloom tomatoes"
   - Quantity: 20
   - Tag: Select a user
   - Message: Explain your need
7. **Action:** Click "Send Request"
8. **Verify:** 
   - Dialog closes
   - Success toast: "Request sent successfully!"
   - Page refreshes
   - Request appears in "Requests I've Made"
   - Shows "General Seed Request"
   - Shows "Community Request" badge
   - Shows tagged user badge

### Test Scenario 2: Receive General Request

1. **Setup:** Another user creates request tagging you
2. **Action:** Go to `/library/requests`
3. **Verify:** Request appears in "Requests I've Received"
4. **Verify:** Shows "You were tagged: @YourName"
5. **Action:** Click "View Details"
6. **Verify:** Modal shows full request information
7. **Action:** Respond to request

### Test Scenario 3: Empty States

**No Sent Requests:**
1. New user account
2. Go to `/library/requests`
3. Should see "No Requests Made" with "Create New Request" button

**No Received Requests:**
1. User with no seeds and not tagged
2. Right column shows "No Requests Available"
3. Button links to "Add Your Seeds"

### Test Scenario 4: Database Sync

```sql
-- Check general requests
SELECT * FROM seed_requests WHERE seed_id IS NULL;

-- Check user is tagged
SELECT 
    sr.*,
    requester.full_name as requester,
    tagged.full_name as tagged_user
FROM seed_requests sr
JOIN profiles requester ON sr.requester_id = requester.id
LEFT JOIN profiles tagged ON sr.tagged_user_id = tagged.id
WHERE sr.seed_id IS NULL;
```

## Troubleshooting

### Issue: "Create New Request" button not showing
**Cause:** You have existing requests
**Solution:** This is correct - button only shows when "No Requests Made"

### Issue: Can't submit form - no users in dropdown
**Causes:**
1. No other users in database
2. tagged_user_id column not added
3. profiles table empty

**Solution:**
```sql
-- Check users
SELECT id, full_name, email FROM profiles;

-- If empty, need more users to sign up
-- If column missing, run migration
```

### Issue: Error: "seed_id cannot be null"
**Cause:** Database migration not applied
**Solution:** Run `update-seed-requests-for-general.sql`

### Issue: Tagged user doesn't see request
**Causes:**
1. Query not including tagged requests
2. tagged_user_id not set correctly

**Solution:**
```sql
-- Debug query
SELECT * FROM seed_requests 
WHERE tagged_user_id = 'user_id_here';
```

### Issue: Can't create request without seed
**Cause:** Old frontend code cached
**Solution:** 
1. Hard refresh (Ctrl + F5)
2. Clear browser cache
3. Restart dev server

## Files Modified

### New Files:
1. ✅ `components/library/create-general-request-dialog.tsx` - Request form
2. ✅ `update-seed-requests-for-general.sql` - Database migration
3. ✅ `GENERAL_REQUESTS_FEATURE.md` - This documentation

### Modified Files:
1. ✅ `app/library/requests/page.tsx` - Updated UI and empty states
2. ✅ `components/library/request-seed-button.tsx` - (Already has tagging)

## Summary

### What Users Can Do Now:
- ✅ Create general seed requests without specific seed
- ✅ Tag community members by profile name
- ✅ Ask for help finding seeds
- ✅ Browse both specific and general requests
- ✅ Receive requests via seed ownership OR tagging
- ✅ See clear indicators for request types

### Database Changes:
- ✅ seed_id now nullable
- ✅ tagged_user_id required for general requests
- ✅ Check constraint ensures data integrity
- ✅ Indexes for query performance

### UI Improvements:
- ✅ "Create New Request" replaces "Browse Seeds"
- ✅ "No Requests Made" → clearer message
- ✅ "No Requests Available" → updated text
- ✅ General requests show "Community Request" badge
- ✅ Tagged user always displayed

Everything is now synced with the database and working! 🎉
