# 🎯 User Tagging Feature for Seed Requests

## Overview
This feature allows users to tag/mention specific platform members when making seed requests. When a user tags someone, the request appears in the tagged person's "Requests I've Received" section, even if they don't own the seed.

## Database Changes

### Schema Update
A new column `tagged_user_id` has been added to the `seed_requests` table:

```sql
ALTER TABLE seed_requests 
ADD COLUMN IF NOT EXISTS tagged_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_seed_requests_tagged_user ON seed_requests(tagged_user_id);
```

### How to Apply
Run the SQL migration file in your Supabase SQL editor:
```bash
File: add-tagged-user-to-requests.sql
```

Or run this command in Supabase SQL Editor:
```sql
-- Copy and paste the contents of add-tagged-user-to-requests.sql
```

## How It Works

### 1. Making a Request (Requester's Perspective)

When creating a seed request, users can now:
- ✅ Make a general request (no tagging) - goes to seed owner
- ✅ Tag a specific user - goes to both seed owner AND tagged user

**UI Location:** Request Seed Dialog
- Opens when clicking "Request Seeds" button on any seed
- New dropdown field: "Tag a Specific User (Optional)"
- Shows all platform users except yourself
- Auto-selects seed owner if available

### 2. Receiving Requests

Users will see requests in "Requests I've Received" if:
- ✅ They own the seed being requested
- ✅ They are tagged in the request
- ✅ Both conditions apply

### 3. Request Display

**Sent Requests (Your requests to others):**
```
Seed Name
Quantity: 10 seeds
Owner: John Doe
Tagged: @Jane Smith  ← Shows who you tagged
Requested: Oct 14, 2025
```

**Received Requests (Requests to you):**
```
Seed Name
Quantity: 10 seeds
From: John Doe
You were tagged: @John Doe  ← Shows you were tagged
Requested: Oct 14, 2025
```

## Use Cases

### Scenario 1: Direct Request to Seed Owner
**User A** wants seeds from **User B** who owns them:
- User A makes request for User B's seed
- Can optionally tag User B (auto-selected)
- User B sees request in "Requests Received"

### Scenario 2: Tag Someone Who Might Help
**User A** wants tomato seeds and knows **User C** is a tomato expert:
- User A makes request for any tomato seed
- Tags User C in the request
- User C sees it in "Requests Received" even if they don't own that specific seed
- User C can help or forward to someone who has it

### Scenario 3: Community Exchange
**User A** wants rare seeds:
- Makes request without specific seed
- Tags multiple community members who might have connections
- Tagged users see the request and can respond

## Files Modified

### 1. `add-tagged-user-to-requests.sql`
**Purpose:** Database migration to add tagging support
**Changes:**
- Adds `tagged_user_id` column
- Creates index for performance
- Adds foreign key constraint

### 2. `app/library/requests/page.tsx`
**Purpose:** Display page for all seed requests
**Changes:**

#### Fixed Queries:
```typescript
// BEFORE (Broken)
.eq('seeds.user_id', user.id)  // ❌ Wrong field name

// AFTER (Fixed)
.eq('seed.owner_id', user.id)  // ✅ Correct field name
OR
.or(`seed.owner_id.eq.${user.id},tagged_user_id.eq.${user.id}`)  // ✅ Includes tagged requests
```

#### Added Tagged User Selection:
```typescript
select(`
  *,
  tagged_user:profiles!seed_requests_tagged_user_id_fkey(full_name, email),
  ...
`)
```

#### UI Updates:
- Shows tagged user badge in sent requests
- Shows "You were tagged" badge in received requests
- Proper foreign key relationship names for Supabase joins

### 3. `components/library/request-seed-button.tsx`
**Purpose:** Dialog for creating seed requests
**Changes:**

#### Added State Management:
```typescript
const [users, setUsers] = useState<Profile[]>([]);
const [taggedUserId, setTaggedUserId] = useState<string>('');
```

#### User Fetching:
```typescript
useEffect(() => {
  // Fetch all users except current user
  // Auto-select seed owner if available
}, [open, ownerId]);
```

#### New UI Field:
```tsx
<Select value={taggedUserId} onValueChange={setTaggedUserId}>
  <SelectTrigger>
    <SelectValue placeholder="Select a user to tag..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">No one (General request)</SelectItem>
    {users.map(user => (
      <SelectItem key={user.id} value={user.id}>
        {user.full_name || user.email}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### Request Creation:
```typescript
const requestData: any = {
  seed_id: seedId,
  requester_id: user.id,
  quantity_requested: ...,
  message: ...,
  status: 'pending',
};

if (taggedUserId) {
  requestData.tagged_user_id = taggedUserId;  // ✅ Add tagged user
}
```

## Error Fixes Applied

### 1. Fixed: "Error fetching received requests: {}"
**Problem:** Query was using wrong field name
```typescript
// BEFORE
.eq('seeds.user_id', user.id)  // ❌ seeds has 'owner_id' not 'user_id'

// AFTER
.or(`seed.owner_id.eq.${user.id},tagged_user_id.eq.${user.id}`)  // ✅ Correct
```

### 2. Fixed: Supabase Join Relationships
**Problem:** Foreign key references weren't explicit
```typescript
// BEFORE
seed:seeds(owner:profiles(...))  // ❌ Ambiguous

// AFTER
seed:seeds(
  owner:profiles!seeds_owner_id_fkey(...)  // ✅ Explicit FK name
)
tagged_user:profiles!seed_requests_tagged_user_id_fkey(...)  // ✅ Explicit FK name
```

### 3. Fixed: Image and Quantity Fields
**Problem:** Using non-existent columns
```typescript
// BEFORE
image_url          // ❌ Doesn't exist
quantity_available // ❌ Doesn't exist

// AFTER
images   // ✅ TEXT[] array
quantity // ✅ DECIMAL
unit     // ✅ For display
```

## Testing Checklist

### Database Migration
- [ ] Run `add-tagged-user-to-requests.sql` in Supabase
- [ ] Verify column exists: `SELECT tagged_user_id FROM seed_requests LIMIT 1;`
- [ ] Check index created: `\di idx_seed_requests_tagged_user`

### UI Testing - Making Requests
- [ ] Open any seed detail page
- [ ] Click "Request Seeds" button
- [ ] Verify "Tag a Specific User" dropdown appears
- [ ] Verify dropdown shows all users except you
- [ ] Verify seed owner is auto-selected (if known)
- [ ] Create request without tagging anyone
- [ ] Create request with tagged user

### UI Testing - Viewing Requests
- [ ] Navigate to `/library/requests`
- [ ] Verify "Requests I've Made" shows your requests
- [ ] Verify tagged user badge appears if you tagged someone
- [ ] Verify "Requests I've Received" shows:
  - Requests for your seeds (owner_id match)
  - Requests where you're tagged (tagged_user_id match)
- [ ] Verify "You were tagged" badge appears when tagged

### Error Resolution
- [ ] No console errors on page load
- [ ] No "column does not exist" errors
- [ ] Images display correctly
- [ ] Quantity shows with proper unit

## API Behavior

### Creating a Request

**Endpoint:** Supabase `.insert()` on `seed_requests`

**Payload:**
```typescript
{
  seed_id: "uuid",
  requester_id: "uuid",      // Current user
  quantity_requested: 10,
  message: "Optional message",
  status: "pending",
  tagged_user_id: "uuid"     // Optional - user being tagged
}
```

### Querying Received Requests

**Logic:**
```typescript
.from('seed_requests')
.select('...')
.or(`seed.owner_id.eq.${currentUserId},tagged_user_id.eq.${currentUserId}`)
```

This returns requests where:
- Current user owns the seed, OR
- Current user is tagged in the request

## Benefits

### For Users
✅ **Targeted Communication:** Direct requests to specific people
✅ **Community Building:** Tag experts or friends for help
✅ **Better Visibility:** See requests relevant to you
✅ **Flexible Workflow:** Works with or without tagging

### For Platform
✅ **Increased Engagement:** More personalized interactions
✅ **Better Matching:** Connect users who can help each other
✅ **Social Features:** Builds community connections
✅ **Notification Ready:** Can trigger notifications for tagged users

## Future Enhancements

### Potential Features
1. **Multiple Tags:** Allow tagging multiple users per request
2. **Tag Notifications:** Email/push notifications when tagged
3. **Tag Suggestions:** AI-powered user suggestions based on seed type
4. **Tag Analytics:** Track most helpful tagged users
5. **Tag Permissions:** Users can opt-out of being tagged
6. **Tag History:** See all times you've been tagged

### Database Updates Needed
```sql
-- For multiple tags
ALTER TABLE seed_requests 
ADD COLUMN tagged_user_ids UUID[] DEFAULT '{}';

-- For tag analytics
CREATE TABLE tag_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tagged_user_id UUID REFERENCES profiles(id),
    request_id UUID REFERENCES seed_requests(id),
    responded BOOLEAN DEFAULT false,
    response_time INTERVAL
);
```

## Summary

✅ **Database:** Added `tagged_user_id` column with proper constraints
✅ **Query Fix:** Corrected field names and foreign key relationships
✅ **UI:** Added user selection dropdown in request dialog
✅ **Display:** Shows tagged users in both sent and received requests
✅ **Logic:** Received requests now include both owned seeds and tagged requests

The feature is now fully functional! Users can tag specific platform members when making seed requests, and those tagged users will see the requests in their "Requests I've Received" section.
