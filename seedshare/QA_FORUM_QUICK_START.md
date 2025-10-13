# Q&A Forum - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Deploy Database Schema (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your SeedShare project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase-qa-forum-schema.sql`
6. Copy ALL contents (Ctrl+A, Ctrl+C)
7. Paste into Supabase SQL Editor
8. Click **Run** button (or press Ctrl+Enter)
9. Wait for "Success. No rows returned" message

✅ **What This Does:**
- Creates 4 tables (questions, answers, question_votes, answer_votes)
- Sets up Row Level Security policies
- Creates automatic triggers for vote counting
- Adds performance indexes

---

### Step 2: Test the Feature (5 minutes)

#### A. Ask Your First Question

1. Run your Next.js app: `cd seedshare && pnpm dev`
2. Login to your account
3. Navigate to **Knowledge Hub** (`/knowledge`)
4. Click **Ask Question** button
5. Fill in the form:
   ```
   Title: How do I prepare soil for tomato planting?
   Content: I'm planning to grow tomatoes for the first time. 
            What soil preparation steps should I follow?
   Category: Crop Management
   Tags: tomatoes, soil, beginners
   ```
6. Click **Post Question**
7. You'll be redirected to your question page

#### B. Answer a Question

1. Stay on the question detail page
2. Scroll to "Your Answer" section
3. Write an answer:
   ```
   For tomatoes, follow these soil preparation steps:

   1. Test your soil pH (tomatoes prefer 6.0-6.8)
   2. Add organic compost (2-3 inches layer)
   3. Mix in balanced fertilizer (10-10-10)
   4. Ensure good drainage
   5. Add calcium to prevent blossom end rot

   Prepare soil 2 weeks before planting for best results.
   ```
4. Click **Post Answer**

#### C. Vote on Content

1. Click the **up arrow** (⬆) on the question - count increases
2. Click **up arrow** again - count decreases (toggle off)
3. Click the **down arrow** (⬇) - count goes negative
4. Test voting on your answer too

#### D. Accept an Answer (Question Author Only)

1. If you're the question author, you'll see a checkmark button (✓)
2. Click it to accept the best answer
3. Answer gets:
   - Green border
   - "Accepted Answer" badge
   - Moved to top
   - Check icon filled in

---

### Step 3: Try Advanced Features (3 minutes)

#### Search & Filter

1. Go back to `/knowledge`
2. Type in search bar: "tomato"
3. Press Enter - see filtered results
4. Click **Pest Control** badge - see only pest questions
5. Try sort options:
   - **Recent**: Newest first
   - **Popular**: Most upvoted first
   - **Unanswered**: Questions without answers

#### View Statistics

1. Look at each question card
2. You'll see:
   - 👍 Upvote count
   - 💬 Answer count
   - 👁 View count
   - ⏰ Time posted (e.g., "2 hours ago")
   - 👤 Author name

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Can create a question
- [ ] Question appears in list
- [ ] Can click to view question details
- [ ] View count increments on each visit
- [ ] Can post an answer
- [ ] Can upvote/downvote question
- [ ] Can upvote/downvote answers
- [ ] Vote toggles when clicking same button twice
- [ ] Can accept answer (as question author)
- [ ] Accepted answer shows green border
- [ ] Search finds questions by keyword
- [ ] Category filter works
- [ ] Sort options change order
- [ ] Must be logged in to post/vote

---

## 🐛 Troubleshooting

### "Tables not found" error
**Solution:** Run the SQL schema in Supabase (Step 1)

### TypeScript errors in `actions.ts`
**Solution:** These are expected until you run the SQL schema. They will auto-resolve after deployment.

### Can't post question/answer
**Solution:** Make sure you're logged in. Check that auth is working.

### Votes not changing
**Solution:** 
1. Verify triggers were created (check SQL output)
2. Check Supabase table editor - verify vote records exist
3. Make sure you're logged in

### "Not authorized" errors
**Solution:** 
1. RLS policies need to be enabled (Step 1 does this)
2. Verify you're logged in with valid session
3. Check Supabase dashboard > Authentication > Users

### Search not working
**Solution:** This is a basic text search. Make sure:
1. You have questions in the database
2. Search term matches question title or content
3. Try simpler/shorter search terms

---

## 📱 Test on Different Devices

The Q&A Forum is fully responsive. Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad - 768x1024)
- [ ] Mobile (iPhone - 375x667)

All features work on all screen sizes!

---

## 🎨 Customization Tips

### Change Categories

Edit these files:
1. `app/knowledge/ask/page.tsx` (line ~20)
2. `components/knowledge/qa-forum.tsx` (line ~25)

```typescript
const categories = [
  'Your Category 1',
  'Your Category 2',
  // ... add more
]
```

### Change Colors

The forum uses these colors:
- Primary: Green (`bg-green-600`)
- Accepted: Green border (`border-green-500`)
- Hover: Accent (`hover:bg-accent`)

Update in each component file or use global CSS.

### Add More Fields

To add fields to questions (e.g., "Priority"):

1. Update SQL schema:
   ```sql
   ALTER TABLE questions ADD COLUMN priority TEXT DEFAULT 'normal';
   ```

2. Update `createQuestion()` in `actions.ts`:
   ```typescript
   priority: formData.priority,
   ```

3. Add to ask page form:
   ```tsx
   <Select name="priority">
     <SelectItem value="low">Low</SelectItem>
     <SelectItem value="normal">Normal</SelectItem>
     <SelectItem value="high">High</SelectItem>
   </Select>
   ```

---

## 🎯 What's Next?

You now have a fully functional Q&A Forum! Consider:

1. **Add Sample Content:**
   - Create 5-10 test questions
   - Post some answers
   - Test voting and acceptance

2. **Invite Beta Testers:**
   - Share `/knowledge` link
   - Ask for feedback
   - Monitor for issues

3. **Enhance Features:**
   - Add rich text editor (Tiptap)
   - Implement notifications
   - Add user reputation system
   - Enable image uploads

4. **Monitor Usage:**
   - Check Supabase dashboard
   - Monitor API usage
   - Track popular categories

---

## 📚 Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `supabase-qa-forum-schema.sql` | Database schema | 235 |
| `app/knowledge/actions.ts` | Server logic | 361 |
| `components/knowledge/qa-forum.tsx` | Question list | 280 |
| `app/knowledge/ask/page.tsx` | Ask question form | 195 |
| `app/knowledge/questions/[id]/page.tsx` | Question detail | 353 |

**Total:** ~1,424 lines of production-ready code!

---

## 🎉 Success!

Your Q&A Forum is now ready to use. The complete implementation includes:

✅ Database with security
✅ All CRUD operations
✅ Voting system with toggles
✅ Answer acceptance
✅ Search and filters
✅ Responsive UI
✅ User authentication
✅ Author verification

**Enjoy your new community feature!** 🚀

For detailed documentation, see `QA_FORUM_COMPLETE.md`
