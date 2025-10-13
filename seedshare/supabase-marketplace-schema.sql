-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2), -- For showing discounts
  currency VARCHAR(10) DEFAULT 'INR',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_order INTEGER DEFAULT 1,
  seed_type VARCHAR(100), -- vegetable, fruit, herb, flower, etc.
  variety VARCHAR(255),
  is_organic BOOLEAN DEFAULT false,
  is_heirloom BOOLEAN DEFAULT false,
  is_hybrid BOOLEAN DEFAULT false,
  germination_rate INTEGER, -- percentage
  images TEXT[], -- Array of image URLs
  weight_per_pack VARCHAR(50), -- e.g., "50g", "100 seeds"
  growing_season VARCHAR(100),
  sowing_method TEXT,
  harvest_time VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, out_of_stock, suspended
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Orders Table
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(20),
  phone_number VARCHAR(20),
  payment_method VARCHAR(50), -- cod, online, upi
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images TEXT[], -- Array of review image URLs
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller Profiles Table (for marketplace-specific seller info)
CREATE TABLE IF NOT EXISTS marketplace_sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name VARCHAR(255),
  business_type VARCHAR(100), -- individual, farm, company
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  bank_account_holder VARCHAR(255),
  business_address TEXT,
  business_city VARCHAR(100),
  business_state VARCHAR(100),
  business_pincode VARCHAR(20),
  business_phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[], -- Array of document URLs
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Table
CREATE TABLE IF NOT EXISTS marketplace_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS marketplace_wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller ON marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seed_type ON marketplace_products(seed_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_created ON marketplace_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller ON marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_product ON marketplace_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_cart_user ON marketplace_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_wishlist_user ON marketplace_wishlist(user_id);

-- Enable Row Level Security
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_products
CREATE POLICY "Anyone can view active products" ON marketplace_products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can insert their own products" ON marketplace_products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products" ON marketplace_products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products" ON marketplace_products
  FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for marketplace_orders
CREATE POLICY "Buyers can view their orders" ON marketplace_orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" ON marketplace_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update orders" ON marketplace_orders
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for marketplace_reviews
CREATE POLICY "Anyone can view reviews" ON marketplace_reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews" ON marketplace_reviews
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own reviews" ON marketplace_reviews
  FOR UPDATE USING (auth.uid() = buyer_id);

-- RLS Policies for marketplace_sellers
CREATE POLICY "Anyone can view verified sellers" ON marketplace_sellers
  FOR SELECT USING (is_verified = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their seller profile" ON marketplace_sellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile" ON marketplace_sellers
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_cart
CREATE POLICY "Users can manage their own cart" ON marketplace_cart
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for marketplace_wishlist
CREATE POLICY "Users can manage their own wishlist" ON marketplace_wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Function to update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_products
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM marketplace_reviews
      WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM marketplace_reviews
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE ON marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_sellers_updated_at BEFORE UPDATE ON marketplace_sellers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
