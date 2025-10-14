# 🤖 AI Chatbot Setup - Google API Key Configuration

## Problem
The AI Chatbot shows "Failed to get response" error because the Google API key is not configured.

## Solution

### Step 1: Get a Free Google API Key

1. **Visit Google AI Studio:**
   - Go to: https://aistudio.google.com/app/apikey
   - Or: https://makersuite.google.com/app/apikey

2. **Sign in with your Google Account:**
   - Use any Google account (Gmail, Workspace, etc.)

3. **Create API Key:**
   - Click **"Create API Key"** button
   - Select **"Create API key in new project"** (recommended)
   - Copy the generated API key

4. **Important:** 
   - Keep your API key secure
   - Don't share it publicly or commit it to Git
   - Free tier includes generous limits for testing

### Step 2: Add API Key to Your Project

1. **Open the `.env.local` file:**
   - Location: `seedshare/.env.local`

2. **Replace the placeholder:**
   ```bash
   # Find this line:
   GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
   
   # Replace with your actual key:
   GOOGLE_API_KEY=AIzaSyC_your_actual_api_key_here
   ```

3. **Save the file**

### Step 3: Restart the Development Server

1. **Stop the current server:**
   - Press `Ctrl + C` in the terminal

2. **Start it again:**
   ```bash
   pnpm dev
   ```

3. **Test the AI Chatbot:**
   - Go to http://localhost:3000/knowledge
   - Send a message
   - You should get a response from SeedSearch AI ✅

## How It Works

### API Configuration
```typescript
// File: app/api/chat/route.ts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
```

### Model Used
- **Backend Model:** `gemini-2.0-flash-exp` (Google's Gemini)
- **Frontend Display:** "SeedSearch AI" (branded name)
- **Features:**
  - Multi-language support (English, Hindi, Punjabi, Haryanvi)
  - Web search integration for current information
  - Formatted responses with numbered lists
  - Agricultural expertise for farmers

### Environment Variables in `.env.local`
```bash
# Required for AI Chatbot
GOOGLE_API_KEY=your_google_api_key_here

# Required for Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=https://robnrtjlgzohlpkljyzy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### Error: "Google API key not configured"
**Solution:** Add your API key to `.env.local` and restart the server

### Error: "Failed to get response"
**Possible causes:**
1. ❌ API key is missing → Add to `.env.local`
2. ❌ API key is invalid → Get a new key from Google AI Studio
3. ❌ API key is not saved → Make sure file is saved
4. ❌ Server not restarted → Restart with `pnpm dev`
5. ❌ Rate limit exceeded → Wait a few minutes or use a new key

### Error: "API key not valid"
**Solution:** 
1. Go to https://aistudio.google.com/app/apikey
2. Check if key is active
3. Create a new key if needed
4. Replace in `.env.local`

## Google API Free Tier Limits

### Gemini 2.0 Flash Experimental
- **Rate Limit:** 1,500 requests per day
- **Token Limit:** 1,500,000 tokens per day
- **Cost:** Free (experimental model)
- **Perfect for:** Development and testing

### Tips to Stay Within Limits
1. Use the app normally - limits are generous
2. Don't spam the AI with many requests
3. Each message costs ~100-500 tokens
4. For production, consider paid tier

## Security Best Practices

### ✅ DO:
- Keep API key in `.env.local` (gitignored)
- Use environment variables
- Restrict API key to specific domains (in Google Console)
- Rotate keys periodically

### ❌ DON'T:
- Commit API keys to Git
- Share keys publicly
- Use same key for multiple projects
- Expose keys in frontend code

## Next Steps

1. ✅ Get Google API key
2. ✅ Add to `.env.local`
3. ✅ Restart server
4. ✅ Test AI chatbot
5. 🎉 Start chatting with SeedSearch AI!

## Support

If you need help:
1. Check this documentation
2. Verify API key is correct
3. Check browser console for errors
4. Check terminal for server errors

## API Key Format Example
```bash
GOOGLE_API_KEY=AIzaSyDPH8k9x7y6z5a4b3c2d1e0f9g8h7i6j5k
```

Your key will look similar but with different characters after `AIzaSy`.

---

**Status:** ✅ Code is now fixed - just needs your Google API key!
