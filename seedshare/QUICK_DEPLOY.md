# 🚀 Quick Deployment Steps

## ⚡ 5-Minute Deployment Checklist

### 1. Sign Up for Vercel
- Go to: https://vercel.com/signup
- Click: **"Continue with GitHub"**
- Authorize Vercel

### 2. Import Project
- Click: **"Add New..." → "Project"**
- Find: **`chetan-s20/SeedShare`**
- Click: **"Import"**

### 3. Configure Root Directory ⚠️ IMPORTANT
- Find: **"Root Directory"**
- Click: **"Edit"**
- Select: **`seedshare`**
- This is critical! Your Next.js app is in the seedshare folder

### 4. Add Environment Variables 🔐 REQUIRED

Add these 3 variables:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://robnrtjlgzohlpkljyzy.supabase.co
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYm5ydGpsZ3pvaGxwa2xqeXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTYwMDMsImV4cCI6MjA3NTc5MjAwM30.D7w-GBivy2r6Gf4Kv_U_U3W7favP2OG7CSZvX_11BM8
```

**Variable 3:** ⚠️ **YOU NEED TO ADD THIS**
```
Name: OPENAI_API_KEY
Value: [Get from https://aistudio.google.com/app/apikey]
```

**How to get Google Gemini API Key:**
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click: **"Create API Key"**
4. Copy the key
5. Paste it in Vercel environment variables

### 5. Deploy
- Click: **"Deploy"**
- Wait: 2-5 minutes
- Done! 🎉

### 6. Update Supabase (Important for Auth)
- Go to: https://supabase.com/dashboard
- Select your project
- Settings → API → URL Configuration
- Add your Vercel URL to **Site URL** and **Redirect URLs**

---

## 📋 Build Settings (Auto-detected)

These should be automatic, but if asked:

```
Framework: Next.js
Root Directory: seedshare
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

---

## 🔥 Common Issues & Quick Fixes

### Issue: "No package.json found"
**Fix:** Set Root Directory to `seedshare`

### Issue: "Build failed"
**Fix:** Check if you removed `--turbopack` from build command (already done ✓)

### Issue: "API routes return 404"
**Fix:** Verify Root Directory is set to `seedshare`

### Issue: "Environment variables not working"
**Fix:** Redeploy after adding variables

### Issue: "AI Chatbot doesn't work"
**Fix:** Make sure OPENAI_API_KEY is added (Google Gemini key)

---

## 🎯 What You Get

After deployment:
- ✅ Live URL: `https://your-project.vercel.app`
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ Preview deployments for branches
- ✅ Free hosting (unlimited projects!)

---

## ⏱️ Estimated Time: 10 minutes

**Steps:**
1. Sign up: 2 min
2. Import & Configure: 3 min
3. Add Environment Variables: 3 min
4. Deploy: 2-5 min
5. Test: 2 min

**Total:** ~15 minutes to go live! 🚀

---

## 📞 Need Help?

- Full Guide: See `VERCEL_DEPLOYMENT_GUIDE.md`
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

---

**Ready? Let's deploy!** 🎉

Visit https://vercel.com/signup to get started!
