-- SeedShare Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('farmer', 'gardener', 'expert', 'admin', 'supplier');
CREATE TYPE seed_status AS ENUM ('available', 'pending', 'exchanged', 'sold_out');
CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'gardener',
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  avatar_url TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seeds Table
CREATE TABLE seeds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  variety TEXT NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  origin TEXT NOT NULL,
  harvest_year INTEGER NOT NULL,
  germination_rate DECIMAL(5,2),
  purity DECIMAL(5,2),
  treatment TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'grams',
  description TEXT,
  status seed_status DEFAULT 'available',
  qr_code_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_organic BOOLEAN DEFAULT false,
  is_heirloom BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Products Table
CREATE TABLE marketplace_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL,
  unit TEXT DEFAULT 'kg',
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  discount_percentage DECIMAL(5,2),
  is_certified BOOLEAN DEFAULT false,
  certification_number TEXT,
  germination_rate DECIMAL(5,2),
  purity DECIMAL(5,2),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_subscription_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'placed',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Requests Table
CREATE TABLE seed_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE NOT NULL,
  quantity_requested DECIMAL(10,2) NOT NULL,
  message TEXT,
  status request_status DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A Posts Table
CREATE TABLE qa_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  seed_id UUID REFERENCES seeds(id) ON DELETE SET NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A Answers Table
CREATE TABLE qa_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES qa_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities Table
CREATE TABLE communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  avatar_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Members Table
CREATE TABLE community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Consultations Table
CREATE TABLE consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expert_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  status consultation_status DEFAULT 'scheduled',
  meeting_link TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification Table
CREATE TABLE gamification (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE product_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_seeds_owner ON seeds(owner_id);
CREATE INDEX idx_seeds_status ON seeds(status);
CREATE INDEX idx_seeds_category ON seeds(category);
CREATE INDEX idx_marketplace_supplier ON marketplace_products(supplier_id);
CREATE INDEX idx_marketplace_category ON marketplace_products(category);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_seed_requests_requester ON seed_requests(requester_id);
CREATE INDEX idx_seed_requests_seed ON seed_requests(seed_id);
CREATE INDEX idx_qa_posts_author ON qa_posts(author_id);
CREATE INDEX idx_qa_posts_category ON qa_posts(category);
CREATE INDEX idx_qa_answers_post ON qa_answers(post_id);
CREATE INDEX idx_communities_region ON communities(region, state);
CREATE INDEX idx_consultations_expert ON consultations(expert_id);
CREATE INDEX idx_consultations_user ON consultations(user_id);
CREATE INDEX idx_gamification_user ON gamification(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Seeds
CREATE POLICY "Seeds are viewable by everyone" ON seeds
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own seeds" ON seeds
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own seeds" ON seeds
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own seeds" ON seeds
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for Marketplace Products
CREATE POLICY "Products are viewable by everyone" ON marketplace_products
  FOR SELECT USING (true);

CREATE POLICY "Suppliers can create products" ON marketplace_products
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update their own products" ON marketplace_products
  FOR UPDATE USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can delete their own products" ON marketplace_products
  FOR DELETE USING (auth.uid() = supplier_id);

-- RLS Policies for Orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Seed Requests
CREATE POLICY "Users can view requests they made or received" ON seed_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR
    auth.uid() IN (SELECT owner_id FROM seeds WHERE id = seed_requests.seed_id)
  );

CREATE POLICY "Users can create seed requests" ON seed_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Seed owners can update requests" ON seed_requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM seeds WHERE id = seed_requests.seed_id)
  );

-- RLS Policies for Q&A Posts
CREATE POLICY "Posts are viewable by everyone" ON qa_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON qa_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON qa_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts" ON qa_posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for Q&A Answers
CREATE POLICY "Answers are viewable by everyone" ON qa_answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON qa_answers
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own answers" ON qa_answers
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own answers" ON qa_answers
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for Communities
CREATE POLICY "Communities are viewable by everyone" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators can update" ON communities
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for Community Members
CREATE POLICY "Community members are viewable by everyone" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Consultations
CREATE POLICY "Users can view their consultations" ON consultations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can book consultations" ON consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update consultations" ON consultations
  FOR UPDATE USING (auth.uid() = expert_id);

-- RLS Policies for Gamification
CREATE POLICY "Users can view their own gamification records" ON gamification
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for Product Reviews
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeds_updated_at BEFORE UPDATE ON seeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seed_requests_updated_at BEFORE UPDATE ON seed_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_posts_updated_at BEFORE UPDATE ON qa_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_answers_updated_at BEFORE UPDATE ON qa_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
