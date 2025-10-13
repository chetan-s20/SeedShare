-- Marketplace Products RLS Policies Setup
-- Run this in Supabase SQL Editor to enable marketplace functionality

-- Step 1: Enable Row Level Security (if not already enabled)
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view available products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can view their own products" ON marketplace_products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can insert products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can update their own products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can delete their own products" ON marketplace_products;

-- Step 3: Create RLS Policies for marketplace_products

-- Policy 1: Everyone (including anonymous users) can view products
CREATE POLICY "Anyone can view available products" 
  ON marketplace_products 
  FOR SELECT 
  USING (true);

-- Policy 2: Authenticated users can insert their own products
CREATE POLICY "Suppliers can insert products" 
  ON marketplace_products 
  FOR INSERT 
  WITH CHECK (auth.uid() = supplier_id);

-- Policy 3: Suppliers can update their own products
CREATE POLICY "Suppliers can update their own products" 
  ON marketplace_products 
  FOR UPDATE 
  USING (auth.uid() = supplier_id);

-- Policy 4: Suppliers can delete their own products
CREATE POLICY "Suppliers can delete their own products" 
  ON marketplace_products 
  FOR DELETE 
  USING (auth.uid() = supplier_id);

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON marketplace_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_products TO authenticated;

-- Step 5: Verify the setup
-- Run these queries to check:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'marketplace_products';
-- SELECT * FROM pg_policies WHERE tablename = 'marketplace_products';

-- Expected results:
-- - RLS should be enabled (rowsecurity = true)
-- - You should see 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- Step 6: Test with sample data (OPTIONAL - remove if not needed)
-- Insert a sample product to test (replace 'YOUR_USER_ID' with actual user ID from auth.users)
/*
INSERT INTO marketplace_products (
  supplier_id,
  name,
  variety,
  category,
  description,
  price,
  quantity_available,
  unit,
  min_order_quantity,
  germination_rate,
  images,
  tags
) VALUES (
  'YOUR_USER_ID', -- Replace with actual user ID from auth.users table
  'Organic Tomato Seeds',
  'Pusa Ruby',
  'vegetable',
  'High-quality organic tomato seeds with excellent germination rate',
  299.00,
  100,
  '50g pack',
  1,
  85.5,
  ARRAY['https://example.com/image1.jpg'],
  ARRAY['organic', 'heirloom', 'summer']
);
*/

-- Step 7: Check if profiles table has proper user data
-- Ensure users exist in profiles table when they signup
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as auth_users FROM auth.users;

-- If counts don't match, profiles table might be missing entries
-- Run fix-profiles-rls.sql to fix authentication issues

COMMENT ON TABLE marketplace_products IS 'Marketplace products with RLS policies enabled';
COMMENT ON POLICY "Anyone can view available products" ON marketplace_products IS 'Public read access for all products';
COMMENT ON POLICY "Suppliers can insert products" ON marketplace_products IS 'Users can only insert products as themselves';
COMMENT ON POLICY "Suppliers can update their own products" ON marketplace_products IS 'Users can only update their own products';
COMMENT ON POLICY "Suppliers can delete their own products" ON marketplace_products IS 'Users can only delete their own products';
