-- Fix for profiles table: Add RLS policies
-- Run this in your Supabase SQL Editor to fix authentication issues
-- This will allow users to see profiles and create/update their own profile

-- Step 1: Enable Row Level Security on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Step 3: Create RLS Policies

-- Policy 1: Allow everyone to view all profiles (public read)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles 
  FOR SELECT 
  USING (true);

-- Policy 2: Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy 4: Allow users to delete their own profile (optional, for account deletion)
CREATE POLICY "Users can delete their own profile" 
  ON profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Step 4: Verify/Create the handle_new_user() function
-- This function automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, points, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'farmer'::user_role,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Step 7: Verify the setup
-- Run this to check if RLS is enabled and policies exist:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
