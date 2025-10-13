# Apply Marketplace Schema to Supabase

## Step-by-Step Guide

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: `robnrtjlgzohlpkljyzy`

### 2. Navigate to SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 3. Copy and Execute the Schema
- Open the file: `supabase-marketplace-schema.sql`
- Copy the ENTIRE contents of the file
- Paste it into the SQL Editor
- Click "Run" button (or press Ctrl+Enter)

### 4. Verify Tables Created
After running, you should see these tables created:
- ✅ `marketplace_products`
- ✅ `marketplace_orders`
- ✅ `marketplace_reviews`
- ✅ `marketplace_sellers`
- ✅ `marketplace_cart`
- ✅ `marketplace_wishlist`

To verify, go to "Table Editor" in the left sidebar and check if all tables appear.

### 5. Check Row Level Security (RLS)
The schema includes RLS policies that:
- Allow anyone to view active products
- Only allow sellers to edit their own products
- Only allow buyers to see their own orders
- Protect user privacy and data

### 6. Ready to Use!
Once the schema is applied, the marketplace will automatically:
- Fetch products from the database
- Display real seller information
- Enable buying functionality
- Track orders and reviews

---

## Quick Test Query

After applying schema, test with this query in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'marketplace%';
```

Should return 6 tables.

---

## Need Help?
- If you see "uuid_generate_v4() does not exist" error, run this first:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```
- If you see permission errors, make sure you're logged in as the project owner

---

**Next Step:** After schema is applied, come back and I'll add sample products for testing!
