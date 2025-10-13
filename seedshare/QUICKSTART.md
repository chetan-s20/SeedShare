# 🚀 Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies

\`\`\`bash
cd seedshare
pnpm install
\`\`\`

### 2. Set Up Supabase

#### A. Create Project
1. Visit [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for setup to complete

#### B. Run Database Schema
1. Open **SQL Editor** in Supabase Dashboard
2. Copy content from \`supabase-schema.sql\`
3. Paste and click **RUN**

#### C. Create Storage Buckets
1. Go to **Storage** tab
2. Click "New bucket" for each:
   - seed-images
   - product-images
   - qr-codes
   - avatars
   - community-images
3. Make all buckets **Public**

### 3. Configure Environment

Create \`.env.local\`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

Get these from: **Project Settings > API**

### 4. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Visit: [http://localhost:3000](http://localhost:3000)

## ✅ Verify Setup

- [ ] Homepage loads
- [ ] Can navigate to Sign Up page
- [ ] Supabase connection working
- [ ] No console errors

## 🎨 Test Features

1. **Create Account**: Sign up as a Gardener
2. **Browse Library**: Visit /library
3. **View Marketplace**: Visit /marketplace
4. **Join Community**: Visit /community

## 🐛 Troubleshooting

**Problem**: "Supabase client error"
- **Solution**: Check environment variables are correct

**Problem**: "SQL syntax error"  
- **Solution**: Run schema file in Supabase SQL Editor (not as markdown)

**Problem**: "Storage bucket not found"
- **Solution**: Create all 5 storage buckets and make them public

## 📚 Next Steps

1. Explore the codebase
2. Read \`DATABASE_SCHEMA.md\`
3. Check \`README.md\` for full documentation
4. Start building features!

## 💡 Pro Tips

- Use the shadcn CLI to add new components: \`npx shadcn@latest add [component]\`
- Database types are auto-generated in \`types/database.types.ts\`
- Use Supabase Studio for visual database management
- Enable RLS policies for security

---

Need help? Check the main README.md or open an issue!
