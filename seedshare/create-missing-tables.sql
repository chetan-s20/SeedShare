-- Create Missing Tables for Profile & Dashboard
-- Run this in your Supabase SQL Editor

-- Create seed_exchanges table if it doesn't exist
CREATE TABLE IF NOT EXISTS seed_exchanges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
  shipping_address JSONB,
  tracking_number TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for seed_exchanges
ALTER TABLE seed_exchanges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seed_exchanges
DROP POLICY IF EXISTS "Users can view exchanges they're involved in" ON seed_exchanges;
CREATE POLICY "Users can view exchanges they're involved in" 
  ON seed_exchanges 
  FOR SELECT 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Users can create seed exchanges" ON seed_exchanges;
CREATE POLICY "Users can create seed exchanges" 
  ON seed_exchanges 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update their own exchanges" ON seed_exchanges;
CREATE POLICY "Users can update their own exchanges" 
  ON seed_exchanges 
  FOR UPDATE 
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = owner_id
  );

-- Enable RLS for marketplace_orders
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_orders
DROP POLICY IF EXISTS "Users can view their orders" ON marketplace_orders;
CREATE POLICY "Users can view their orders" 
  ON marketplace_orders 
  FOR SELECT 
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

DROP POLICY IF EXISTS "Users can create orders" ON marketplace_orders;
CREATE POLICY "Users can create orders" 
  ON marketplace_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Sellers can update order status" ON marketplace_orders;
CREATE POLICY "Sellers can update order status" 
  ON marketplace_orders 
  FOR UPDATE 
  USING (auth.uid() = seller_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seed_exchanges_requester ON seed_exchanges(requester_id);
CREATE INDEX IF NOT EXISTS idx_seed_exchanges_owner ON seed_exchanges(owner_id);
CREATE INDEX IF NOT EXISTS idx_seed_exchanges_status ON seed_exchanges(status);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller ON marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created ON marketplace_orders(created_at DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_seed_exchanges_updated_at ON seed_exchanges;
CREATE TRIGGER update_seed_exchanges_updated_at 
  BEFORE UPDATE ON seed_exchanges 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_orders_updated_at ON marketplace_orders;
CREATE TRIGGER update_marketplace_orders_updated_at 
  BEFORE UPDATE ON marketplace_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Missing tables created successfully! ✅' as status;
