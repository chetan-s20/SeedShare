-- Fix Row Level Security (RLS) Policies
-- This fixes the "new row violates row-level security policy" error
-- SAFE TO RUN MULTIPLE TIMES - Uses DROP IF EXISTS

-- ==========================================
-- FIX 1: Gamification Table - Add INSERT Policy
-- ==========================================
-- The gamification table only has SELECT policy, missing INSERT

-- Drop existing policies first (safe - won't error if they don't exist)
DROP POLICY IF EXISTS "Users can view their own gamification records" ON gamification;
DROP POLICY IF EXISTS "Users can insert their own gamification records" ON gamification;
DROP POLICY IF EXISTS "System can insert gamification records" ON gamification;

-- Allow users to view their own records
CREATE POLICY "Users can view their own gamification records" 
  ON gamification 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own gamification records
CREATE POLICY "Users can insert their own gamification records" 
  ON gamification 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- FIX 2: Seeds Table - Verify Policies
-- ==========================================
-- Ensure seeds table has proper INSERT policy

DROP POLICY IF EXISTS "Seeds are viewable by everyone" ON seeds;
DROP POLICY IF EXISTS "Users can create their own seeds" ON seeds;
DROP POLICY IF EXISTS "Users can update their own seeds" ON seeds;
DROP POLICY IF EXISTS "Users can delete their own seeds" ON seeds;

CREATE POLICY "Seeds are viewable by everyone" 
  ON seeds 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own seeds" 
  ON seeds 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own seeds" 
  ON seeds 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own seeds" 
  ON seeds 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- ==========================================
-- FIX 3: Community Posts - Add INSERT Policy
-- ==========================================

DROP POLICY IF EXISTS "Everyone can view posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

CREATE POLICY "Everyone can view posts" 
  ON community_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create posts" 
  ON community_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON community_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON community_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ==========================================
-- FIX 4: Marketplace Products - Verify Policies
-- ==========================================

DROP POLICY IF EXISTS "Products are viewable by everyone" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can create products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can update their own products" ON marketplace_products;
DROP POLICY IF EXISTS "Suppliers can delete their own products" ON marketplace_products;

CREATE POLICY "Products are viewable by everyone" 
  ON marketplace_products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Suppliers can create products" 
  ON marketplace_products 
  FOR INSERT 
  WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update their own products" 
  ON marketplace_products 
  FOR UPDATE 
  USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can delete their own products" 
  ON marketplace_products 
  FOR DELETE 
  USING (auth.uid() = supplier_id);

-- ==========================================
-- FIX 5: Seed Exchanges - Add Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can view exchanges they're involved in" ON seed_exchanges;
DROP POLICY IF EXISTS "Users can create seed exchanges" ON seed_exchanges;
DROP POLICY IF EXISTS "Users can update their own exchanges" ON seed_exchanges;

CREATE POLICY "Users can view exchanges they're involved in" 
  ON seed_exchanges 
  FOR SELECT 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = owner_id
  );

CREATE POLICY "Users can create seed exchanges" 
  ON seed_exchanges 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own exchanges" 
  ON seed_exchanges 
  FOR UPDATE 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = owner_id
  );

-- ==========================================
-- FIX 6: Marketplace Orders - Add Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can view their orders" ON marketplace_orders;
DROP POLICY IF EXISTS "Users can create orders" ON marketplace_orders;
DROP POLICY IF EXISTS "Sellers can update order status" ON marketplace_orders;

CREATE POLICY "Users can view their orders" 
  ON marketplace_orders 
  FOR SELECT 
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

CREATE POLICY "Users can create orders" 
  ON marketplace_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status" 
  ON marketplace_orders 
  FOR UPDATE 
  USING (auth.uid() = seller_id);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'seeds', 'gamification', 'community_posts', 
    'marketplace_products', 'seed_exchanges', 'marketplace_orders'
  )
ORDER BY tablename;

-- Check policies for gamification table
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'gamification';

-- Check policies for seeds table
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'seeds';

SELECT '✅ RLS Policies Fixed Successfully!' as status;
