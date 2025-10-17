# 🚀 SeedShare Vercel Deployment Guide

## Prerequisites

✅ GitHub account (you already have this)  
✅ Your code is pushed to GitHub (done! ✓)  
✅ Vercel account (free tier is sufficient)

## Step-by-Step Deployment Instructions

### Step 1: Create a Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"** (recommended)
3. Authorize Vercel to access your GitHub account
4. Complete the sign-up process

### Step 2: Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see "Import Git Repository"
3. Find your repository: **`chetan-s20/SeedShare`**
   - If you don't see it, click **"Adjust GitHub App Permissions"** and grant access
4. Click **"Import"** next to your repository

### Step 3: Configure Project Settings

#### Root Directory Configuration

**IMPORTANT**: Since your Next.js app is in the `seedshare` subdirectory:

1. In the "Configure Project" screen, find **"Root Directory"**
2. Click **"Edit"**
3. Select **`seedshare`** from the dropdown
4. This tells Vercel where your Next.js app is located

#### Build Settings (Auto-detected)

Vercel will automatically detect:
- **Framework Preset**: Next.js
- **Build Command**: `next build --turbopack` or `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

**Note**: You may need to change the build command from `next build --turbopack` to just `next build` as Vercel might not support Turbopack yet.

### Step 4: Configure Environment Variables

**CRITICAL**: Add your environment variables before deploying!

Click on **"Environment Variables"** section and add:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://robnrtjlgzohlpkljyzy.supabase.co`
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYm5ydGpsZ3pvaGxwa2xqeXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTYwMDMsImV4cCI6MjA3NTc5MjAwM30.D7w-GBivy2r6Gf4Kv_U_U3W7favP2OG7CSZvX_11BM8`
   - Environment: Production, Preview, Development

3. **OPENAI_API_KEY** (Google Gemini API Key)
   - Value: Your Google Gemini API key (get from https://aistudio.google.com/app/apikey)
   - Environment: Production, Preview, Development
   - **⚠️ REQUIRED** - The AI chatbot won't work without this!

### Step 5: Deploy

1. Review all settings
2. Click **"Deploy"**
3. Vercel will:
   - Clone your repository
   - Install dependencies with pnpm
   - Build your Next.js app
   - Deploy to a production URL
4. Wait 2-5 minutes for the build to complete

### Step 6: Get Your Live URL

Once deployed, you'll get a URL like:
- **Production**: `https://your-project-name.vercel.app`
- **Preview**: `https://your-project-name-git-branch.vercel.app`

## Build Configuration Issues & Solutions

### Issue 1: Turbopack Not Supported on Vercel

If the build fails with Turbopack errors, you need to update your build command.

**Fix**: Update `package.json` build script:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",  // Remove --turbopack for Vercel
  "start": "next start",
  "lint": "eslint"
}
```

Or override in Vercel dashboard:
- Build Command: `pnpm build` or `next build`

### Issue 2: Root Directory Configuration

If deployment fails with "No package.json found":

**Fix**: 
1. Go to Project Settings → General
2. Set **Root Directory** to `seedshare`
3. Redeploy

### Issue 3: Environment Variables Missing

If the app loads but features don't work:

**Fix**: 
1. Go to Project Settings → Environment Variables
2. Add all required variables (see Step 4)
3. Redeploy from Deployments tab

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

### 2. Supabase Configuration

Update your Supabase project settings:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `robnrtjlgzohlpkljyzy`
3. Go to Settings → API → URL Configuration
4. Add your Vercel URL to **Site URL**:
   - `https://your-project-name.vercel.app`
5. Add to **Redirect URLs**:
   - `https://your-project-name.vercel.app/auth/callback`
   - `https://your-project-name.vercel.app/**`

### 3. Test Your Deployment

Visit your live URL and test:

- ✅ Homepage loads
- ✅ Navigation works
- ✅ Authentication works (sign up/login)
- ✅ Seed Library displays
- ✅ Marketplace loads
- ✅ Communities feature works
- ✅ Knowledge Hub loads
- ✅ AI Chatbot responds (requires OPENAI_API_KEY)
- ✅ Quality Test / Seed Analysis works (requires OPENAI_API_KEY)

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Deploys to production
- **Push to other branches** → Creates preview deployment
- **Pull requests** → Creates preview deployment with unique URL

## Monitoring & Logs

### View Deployment Logs

1. Go to your project dashboard
2. Click on **"Deployments"** tab
3. Click on any deployment
4. View build logs and runtime logs

### Analytics (Optional)

1. Go to Project → Analytics
2. Enable Vercel Analytics
3. Track page views, performance, and Web Vitals

## Troubleshooting Common Issues

### Build Fails with "Module not found"

**Solution**: 
```bash
# Locally, clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

Then push changes to GitHub.

### API Routes Return 404

**Solution**: Ensure `seedshare` is set as root directory in Vercel settings.

### Environment Variables Not Working

**Solution**: 
1. Check variable names match exactly (case-sensitive)
2. Redeploy after adding variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables

### Supabase Connection Fails

**Solution**:
1. Verify environment variables are correct
2. Check Supabase project is active
3. Ensure Vercel URL is whitelisted in Supabase

## Performance Optimization

### 1. Image Optimization

Next.js automatically optimizes images. Ensure you're using:
```tsx
import Image from 'next/image'
```

### 2. Enable Edge Runtime (Optional)

For faster API responses, add to your API routes:
```typescript
export const runtime = 'edge'
```

### 3. Enable ISR (Incremental Static Regeneration)

For pages that don't change often:
```typescript
export const revalidate = 3600 // Revalidate every hour
```

## Cost Estimation

### Free Tier Includes:
- Unlimited deployments
- 100GB bandwidth per month
- Serverless function executions
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

### Paid Features (if needed):
- Pro Plan: $20/month
  - 1TB bandwidth
  - Advanced analytics
  - Team collaboration
  - Password protection

**Your project should work perfectly on the free tier!**

## Security Considerations

### 1. Protect Environment Variables

- ✅ Never commit `.env.local` to GitHub
- ✅ Add `.env*.local` to `.gitignore`
- ✅ Use Vercel's environment variables feature

### 2. API Key Security

- ✅ OPENAI_API_KEY should be server-side only (no NEXT_PUBLIC_ prefix)
- ✅ Supabase ANON_KEY can be public (it's designed for client-side use)

### 3. Enable Supabase RLS (Row Level Security)

Ensure your Supabase tables have proper RLS policies enabled.

## Quick Commands Reference

```bash
# Check build locally before deploying
cd C:/Users/victus/Desktop/last/SeedShare/seedshare
pnpm build

# Install Vercel CLI (optional)
npm install -g vercel

# Deploy from CLI (optional)
vercel

# Deploy to production from CLI
vercel --prod
```

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Support**: https://vercel.com/support
- **Community Discord**: https://discord.gg/vercel

## Checklist Before Going Live

- [ ] All environment variables configured
- [ ] Google Gemini API key added
- [ ] Supabase URLs updated
- [ ] Test authentication flow
- [ ] Test AI chatbot
- [ ] Test seed analysis feature
- [ ] Test all pages load correctly
- [ ] Check mobile responsiveness
- [ ] Review error logs
- [ ] Set up custom domain (optional)

---

## 🎉 Ready to Deploy!

Follow the steps above, and your SeedShare app will be live in minutes!

**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy  
**Cost**: Free (on Vercel's free tier)

Good luck with your deployment! 🚀
