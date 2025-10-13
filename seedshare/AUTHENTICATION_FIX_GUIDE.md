# AUTHENTICATION FIX - STEP BY STEP GUIDE

## Problem Summary
Your login credentials are not visible in Supabase and profiles are not showing after login because:
1. **Missing RLS Policies**: The `profiles` table had Row Level Security enabled but no policies to allow reading/writing
2. **Missing Trigger**: The auto-create profile trigger may not be set up in your Supabase database
3. **Build Error**: Missing MarketplaceProductCard component

## ✅ Fixed Issues
1. ✅ Created `MarketplaceProductCard` component (build error fixed)
2. ✅ Created SQL script with RLS policies for profiles table
3. ✅ Updated trigger function to auto-create profiles on signup

---

## 🚀 STEP-BY-STEP FIX (Follow in Order)

### Step 1: Run SQL Script in Supabase
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project: `robnrtjlgzohlpkljyzy.supabase.co`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the **ENTIRE contents** of `fix-profiles-rls.sql` file
6. Click **Run** or press `Ctrl + Enter`
7. Wait for success message: "Success. No rows returned"

### Step 2: Verify the Setup in Supabase
1. Go to **Authentication** > **Users** in Supabase Dashboard
2. You should see any users you've created (email addresses)
3. Go to **Table Editor** > **profiles** table
4. Check if profiles exist for your users
   - If NO profiles exist, that's okay - they'll be created on next signup/login
   - If profiles exist but you couldn't see them before, RLS is now fixed!

### Step 3: Test the Dev Server
1. Make sure dev server is running:
   ```powershell
   cd c:\Users\Admin\Desktop\SeedShare-1\seedshare
   pnpm dev
   ```
2. Open browser: http://localhost:3003

### Step 4: Test Signup Flow
1. Go to: http://localhost:3003/signup
2. Fill in the form with NEW email (not previously used):
   - Email: test@example.com
   - Password: Test123456
   - Full Name: Test User
   - Phone: 1234567890
   - Location: Test City
3. Click "Sign Up"
4. You should be redirected to /login
5. Check Supabase Dashboard:
   - **Authentication > Users**: New user should appear
   - **Table Editor > profiles**: New profile should be created

### Step 5: Test Login Flow
1. Go to: http://localhost:3003/login
2. Enter the credentials you just created
3. Click "Sign In"
4. You should be redirected to /dashboard
5. Your profile should appear in the top-right navbar with:
   - Your name
   - Email
   - Role badge
   - Points

### Step 6: Check Profile Pages
1. Click on your profile in the navbar
2. Go to **Profile** - should show your profile info
3. Go to **Dashboard** - should show your activity
4. Go to **Settings** - should allow you to edit your profile

---

## 🔍 Troubleshooting

### Issue: "Still can't see profiles in Supabase"
**Solution**: 
- Make sure you ran the SQL script completely
- Check if RLS is enabled: Go to Table Editor > profiles > Click settings icon > Check "Enable Row Level Security"
- Verify policies exist: Run this query in SQL Editor:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'profiles';
  ```

### Issue: "Login works but no profile appears in navbar"
**Solution**:
- Check browser console (F12) for errors
- Verify the profile was created in Supabase Table Editor
- Check if `layout.tsx` is fetching the profile correctly
- Hard refresh the page (Ctrl + Shift + R)

### Issue: "Signup creates auth user but no profile"
**Solution**:
- Verify the trigger is active:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Check Supabase logs for any errors during signup
- Try creating profile manually for existing users:
  ```sql
  INSERT INTO profiles (id, email, full_name, role, points)
  SELECT id, email, raw_user_meta_data->>'full_name', 'farmer'::user_role, 0
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM profiles);
  ```

### Issue: "Build error about MarketplaceProductCard"
**Solution**: Already fixed! The component is now created in:
`app/marketplace/product-card.tsx`

---

## 📋 What Was Changed

### 1. Created `fix-profiles-rls.sql`
- Enables Row Level Security on profiles table
- Creates 4 RLS policies:
  - SELECT: Everyone can view all profiles (public)
  - INSERT: Users can create their own profile (auth.uid() = id)
  - UPDATE: Users can update their own profile
  - DELETE: Users can delete their own profile
- Creates/updates `handle_new_user()` trigger function
- Grants necessary permissions

### 2. Created `app/marketplace/product-card.tsx`
- MarketplaceProductCard component for displaying products
- Shows product image, name, variety, category
- Displays price, ratings, certifications
- Includes "View Details" button

### 3. Authentication Flow Updates (Already Done)
- `app/login/page.tsx`: Uses hard redirects with session delay
- `app/signup/page.tsx`: Creates profile in database after signup
- `app/auth/callback/route.ts`: Creates profile for OAuth users

---

## ✅ Verification Checklist

After completing all steps, verify:
- [ ] SQL script ran successfully in Supabase
- [ ] RLS policies exist in profiles table
- [ ] Trigger `on_auth_user_created` is active
- [ ] New signup creates both auth user AND profile
- [ ] Login redirects to dashboard
- [ ] Profile appears in navbar after login
- [ ] Can view Profile, Dashboard, Settings pages
- [ ] Build completes without errors
- [ ] Dev server runs without errors

---

## 🎯 Expected Results

After fixing:
1. **Supabase Authentication Tab**: Shows all users with their emails
2. **Supabase Profiles Table**: Shows corresponding profiles for each user
3. **After Login**: Navbar shows user name, role badge, and points
4. **Profile Pages**: All working with real data from database
5. **No Mock Data**: All data comes from Supabase database

---

## 📞 If Issues Persist

If you still have problems after following all steps:
1. Share screenshots of:
   - Supabase Authentication > Users page
   - Supabase Table Editor > profiles table
   - Browser console errors (F12)
   - SQL Editor results after running the script
2. Check Supabase logs: Dashboard > Logs > SQL Logs
3. Verify environment variables in `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## 🔐 Security Notes

- RLS policies ensure users can only edit their OWN profile
- All users can VIEW all profiles (needed for marketplace, community features)
- Trigger runs with SECURITY DEFINER to bypass RLS during profile creation
- OAuth users (Google login) automatically get profiles created

---

Good luck! The authentication system should now work properly. 🎉
