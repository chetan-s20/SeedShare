-- =====================================================
-- COMPLETE DATABASE SETUP - SAFE VERSION
-- This checks if things exist before creating them
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'gardener', 'expert', 'admin', 'supplier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seed_status AS ENUM ('available', 'pending', 'exchanged', 'sold_out');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS seeds (
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
CREATE TABLE IF NOT EXISTS marketplace_products (
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
CREATE TABLE IF NOT EXISTS orders (
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
CREATE TABLE IF NOT EXISTS seed_requests (
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
CREATE TABLE IF NOT EXISTS qa_posts (
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
CREATE TABLE IF NOT EXISTS qa_answers (
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
CREATE TABLE IF NOT EXISTS communities (
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
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
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
CREATE TABLE IF NOT EXISTS gamification (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
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

-- =====================================================
-- COMMUNITY EXTENSION TABLES
-- =====================================================

-- Drop community tables if they exist (clean start for community features)
DROP TABLE IF EXISTS comment_votes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS saved_posts CASCADE;
DROP TABLE IF EXISTS post_votes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_settings CASCADE;

-- Community Posts Table
CREATE TABLE community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'text',
    images TEXT[],
    link_url TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Votes Table
CREATE TABLE post_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post Comments Table
CREATE TABLE post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Votes Table
CREATE TABLE comment_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Saved Posts Table
CREATE TABLE saved_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Community Settings Table
CREATE TABLE community_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    banner_url TEXT,
    rules TEXT[],
    post_approval_required BOOLEAN DEFAULT false,
    allow_images BOOLEAN DEFAULT true,
    allow_links BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Main tables indexes
CREATE INDEX IF NOT EXISTS idx_seeds_owner ON seeds(owner_id);
CREATE INDEX IF NOT EXISTS idx_seeds_status ON seeds(status);
CREATE INDEX IF NOT EXISTS idx_seeds_category ON seeds(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_supplier ON marketplace_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_seed_requests_requester ON seed_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_seed_requests_seed ON seed_requests(seed_id);
CREATE INDEX IF NOT EXISTS idx_qa_posts_author ON qa_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_qa_posts_category ON qa_posts(category);
CREATE INDEX IF NOT EXISTS idx_qa_answers_post ON qa_answers(post_id);
CREATE INDEX IF NOT EXISTS idx_communities_region ON communities(region, state);
CREATE INDEX IF NOT EXISTS idx_consultations_expert ON consultations(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_user ON gamification(user_id);

-- Community tables indexes
CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_upvotes ON community_posts(upvotes DESC);
CREATE INDEX idx_post_votes_post ON post_votes(post_id);
CREATE INDEX idx_post_votes_user ON post_votes(user_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_author ON post_comments(author_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user ON comment_votes(user_id);
CREATE INDEX idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post ON saved_posts(post_id);
CREATE INDEX idx_community_settings_slug ON community_settings(slug);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
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
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Seeds policies
DROP POLICY IF EXISTS "Seeds are viewable by everyone" ON seeds;
CREATE POLICY "Seeds are viewable by everyone" ON seeds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own seeds" ON seeds;
CREATE POLICY "Users can create their own seeds" ON seeds FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own seeds" ON seeds;
CREATE POLICY "Users can update their own seeds" ON seeds FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own seeds" ON seeds;
CREATE POLICY "Users can delete their own seeds" ON seeds FOR DELETE USING (auth.uid() = owner_id);

-- Marketplace policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON marketplace_products;
CREATE POLICY "Products are viewable by everyone" ON marketplace_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Suppliers can create products" ON marketplace_products;
CREATE POLICY "Suppliers can create products" ON marketplace_products FOR INSERT WITH CHECK (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers can update their own products" ON marketplace_products;
CREATE POLICY "Suppliers can update their own products" ON marketplace_products FOR UPDATE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers can delete their own products" ON marketplace_products;
CREATE POLICY "Suppliers can delete their own products" ON marketplace_products FOR DELETE USING (auth.uid() = supplier_id);

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed requests policies
DROP POLICY IF EXISTS "Users can view requests they made or received" ON seed_requests;
CREATE POLICY "Users can view requests they made or received" ON seed_requests
    FOR SELECT USING (
        auth.uid() = requester_id OR
        auth.uid() IN (SELECT owner_id FROM seeds WHERE id = seed_requests.seed_id)
    );

DROP POLICY IF EXISTS "Users can create seed requests" ON seed_requests;
CREATE POLICY "Users can create seed requests" ON seed_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Seed owners can update requests" ON seed_requests;
CREATE POLICY "Seed owners can update requests" ON seed_requests
    FOR UPDATE USING (
        auth.uid() IN (SELECT owner_id FROM seeds WHERE id = seed_requests.seed_id)
    );

-- Q&A Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON qa_posts;
CREATE POLICY "Posts are viewable by everyone" ON qa_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON qa_posts;
CREATE POLICY "Authenticated users can create posts" ON qa_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own posts" ON qa_posts;
CREATE POLICY "Authors can update their own posts" ON qa_posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own posts" ON qa_posts;
CREATE POLICY "Authors can delete their own posts" ON qa_posts FOR DELETE USING (auth.uid() = author_id);

-- Q&A Answers policies  
DROP POLICY IF EXISTS "Answers are viewable by everyone" ON qa_answers;
CREATE POLICY "Answers are viewable by everyone" ON qa_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create answers" ON qa_answers;
CREATE POLICY "Authenticated users can create answers" ON qa_answers FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own answers" ON qa_answers;
CREATE POLICY "Authors can update their own answers" ON qa_answers FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own answers" ON qa_answers;
CREATE POLICY "Authors can delete their own answers" ON qa_answers FOR DELETE USING (auth.uid() = author_id);

-- Communities policies
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Community creators can update" ON communities;
CREATE POLICY "Community creators can update" ON communities FOR UPDATE USING (auth.uid() = created_by);

-- Community members policies
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON community_members;
CREATE POLICY "Community members are viewable by everyone" ON community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join communities" ON community_members;
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave communities" ON community_members;
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- Consultations policies
DROP POLICY IF EXISTS "Users can view their consultations" ON consultations;
CREATE POLICY "Users can view their consultations" ON consultations FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);

DROP POLICY IF EXISTS "Users can book consultations" ON consultations;
CREATE POLICY "Users can book consultations" ON consultations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Experts can update consultations" ON consultations;
CREATE POLICY "Experts can update consultations" ON consultations FOR UPDATE USING (auth.uid() = expert_id);

-- Gamification policies
DROP POLICY IF EXISTS "Users can view their own gamification records" ON gamification;
CREATE POLICY "Users can view their own gamification records" ON gamification FOR SELECT USING (auth.uid() = user_id);

-- Product reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON product_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON product_reviews;
CREATE POLICY "Users can update their own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON product_reviews;
CREATE POLICY "Users can delete their own reviews" ON product_reviews FOR DELETE USING (auth.uid() = user_id);

-- Community Posts Policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON community_posts;
CREATE POLICY "Posts are viewable by everyone" ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own posts" ON community_posts;
CREATE POLICY "Authors can update their own posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own posts" ON community_posts;
CREATE POLICY "Authors can delete their own posts" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Post Votes Policies
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON post_votes;
CREATE POLICY "Votes are viewable by everyone" ON post_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON post_votes;
CREATE POLICY "Authenticated users can vote" ON post_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own votes" ON post_votes;
CREATE POLICY "Users can update their own votes" ON post_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON post_votes;
CREATE POLICY "Users can delete their own votes" ON post_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post Comments Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON post_comments;
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (is_deleted = false OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can comment" ON post_comments;
CREATE POLICY "Authenticated users can comment" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments" ON post_comments;
CREATE POLICY "Authors can update their own comments" ON post_comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own comments" ON post_comments;
CREATE POLICY "Authors can delete their own comments" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Comment Votes Policies
DROP POLICY IF EXISTS "Comment votes are viewable by everyone" ON comment_votes;
CREATE POLICY "Comment votes are viewable by everyone" ON comment_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote on comments" ON comment_votes;
CREATE POLICY "Authenticated users can vote on comments" ON comment_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comment votes" ON comment_votes;
CREATE POLICY "Users can update their own comment votes" ON comment_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comment votes" ON comment_votes;
CREATE POLICY "Users can delete their own comment votes" ON comment_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saved Posts Policies
DROP POLICY IF EXISTS "Users can view their own saved posts" ON saved_posts;
CREATE POLICY "Users can view their own saved posts" ON saved_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts" ON saved_posts;
CREATE POLICY "Users can save posts" ON saved_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave posts" ON saved_posts;
CREATE POLICY "Users can unsave posts" ON saved_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Community Settings Policies
DROP POLICY IF EXISTS "Community settings are viewable by everyone" ON community_settings;
CREATE POLICY "Community settings are viewable by everyone" ON community_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Community creators can update settings" ON community_settings;
CREATE POLICY "Community creators can update settings" ON community_settings
    FOR UPDATE TO authenticated
    USING (community_id IN (SELECT id FROM communities WHERE created_by = auth.uid()));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seeds_updated_at ON seeds;
CREATE TRIGGER update_seeds_updated_at BEFORE UPDATE ON seeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seed_requests_updated_at ON seed_requests;
CREATE TRIGGER update_seed_requests_updated_at BEFORE UPDATE ON seed_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qa_posts_updated_at ON qa_posts;
CREATE TRIGGER update_qa_posts_updated_at BEFORE UPDATE ON qa_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qa_answers_updated_at ON qa_answers;
CREATE TRIGGER update_qa_answers_updated_at BEFORE UPDATE ON qa_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Community triggers
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_settings_updated_at ON community_settings;
CREATE TRIGGER update_community_settings_updated_at BEFORE UPDATE ON community_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE community_posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE community_posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE community_posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE community_posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE community_posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_vote_count_trigger ON post_votes;
CREATE TRIGGER post_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW EXECUTE FUNCTION update_post_vote_count();

-- Function to update comment count on posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_comment_count_trigger ON post_comments;
CREATE TRIGGER post_comment_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE post_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE post_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE post_comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE post_comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE post_comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE post_comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_vote_count_trigger ON comment_votes;
CREATE TRIGGER comment_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comment_votes
  FOR EACH ROW EXECUTE FUNCTION update_comment_vote_count();

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT '✅ Database setup complete! All tables created successfully.' as status;

-- Show table count
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';
