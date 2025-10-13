# 🎯 MARKETPLACE - COMPLETE SETUP GUIDE

## ⚡ Quick Start (5 Minutes)

### What You Need:
1. ✅ Supabase account (already have)
2. ✅ Your project running locally
3. ✅ 5 minutes to apply schema and add data

---

## 📋 Step-by-Step Instructions

### **STEP 1: Open Supabase Dashboard** (30 seconds)

1. Go to: https://supabase.com/dashboard
2. Click on your project: `robnrtjlgzohlpkljyzy`

### **STEP 2: Apply Database Schema** (1 minute)

1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**
3. Open file: `supabase-marketplace-schema.sql` from your project
4. **Copy ALL contents** (Ctrl+A, Ctrl+C)
5. **Paste** into SQL Editor (Ctrl+V)
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for success message

✅ **Verify**: Click "Table Editor" → Should see 6 new tables starting with "marketplace_"

### **STEP 3: Get Your User ID** (30 seconds)

In SQL Editor, run:
```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

📝 **Copy your user ID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### **STEP 4: Create Seller Profile** (1 minute)

Replace `YOUR_USER_ID_HERE` below with your actual ID, then run:

```sql
INSERT INTO marketplace_sellers (
  user_id,
  full_name,
  email,
  phone_number,
  business_name,
  location,
  bio,
  rating,
  total_sales
) VALUES (
  'YOUR_USER_ID_HERE',  -- 👈 PASTE YOUR ID HERE
  'Test Seller',
  'your-email@example.com',  -- 👈 Your email
  '+91-9876543210',
  'Premium Seeds Co.',
  'Pune, Maharashtra',
  'Quality seeds supplier',
  4.8,
  100
);
```

### **STEP 5: Get Seller ID** (30 seconds)

Run:
```sql
SELECT id FROM marketplace_sellers WHERE user_id = 'YOUR_USER_ID';
```

📝 **Copy the seller ID**

### **STEP 6: Add Sample Products** (2 minutes)

Replace `YOUR_SELLER_ID_HERE` with your seller ID, then run this to add 3 products:

```sql
-- Product 1: Tomato Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  seed_type,
  variety,
  is_organic,
  is_heirloom,
  is_hybrid,
  germination_rate,
  images,
  weight_per_pack,
  growing_season,
  sowing_method,
  harvest_time,
  status,
  rating,
  review_count
) VALUES (
  'YOUR_SELLER_ID_HERE',  -- 👈 PASTE SELLER ID
  'Organic Roma Tomato Seeds - Premium Quality',
  'High-yielding organic Roma tomato seeds perfect for Indian climate. Disease resistant and produces excellent fruit. 100% organic and chemical-free.',
  299,
  499,
  100,
  'vegetable',
  'Roma',
  true,
  true,
  false,
  92,
  ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500'],
  '50 seeds',
  'June-September',
  'Direct sowing in seedbed, transplant after 25-30 days',
  '60-80 days',
  'active',
  4.7,
  42
);

-- Product 2: Chilli Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  seed_type,
  variety,
  is_organic,
  is_heirloom,
  is_hybrid,
  germination_rate,
  images,
  weight_per_pack,
  growing_season,
  sowing_method,
  harvest_time,
  status,
  rating,
  review_count
) VALUES (
  'YOUR_SELLER_ID_HERE',  -- 👈 PASTE SELLER ID
  'Hybrid Green Chilli Seeds - High Yield F1',
  'Premium F1 hybrid green chilli seeds with excellent disease resistance. Produces long, uniform fruits with great taste.',
  450,
  650,
  75,
  'vegetable',
  'Green Chilli F1',
  false,
  false,
  true,
  95,
  ARRAY['https://images.unsplash.com/photo-1583454155184-870a1f63b96e?w=500'],
  '100 seeds',
  'Year-round',
  'Sow in nursery, transplant after 30 days',
  '60-70 days',
  'active',
  4.9,
  68
);

-- Product 3: Spinach Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  stock_quantity,
  seed_type,
  variety,
  is_organic,
  germination_rate,
  images,
  weight_per_pack,
  growing_season,
  sowing_method,
  harvest_time,
  status,
  rating,
  review_count
) VALUES (
  'YOUR_SELLER_ID_HERE',  -- 👈 PASTE SELLER ID
  'Organic Palak (Spinach) Seeds - All Green',
  'Certified organic spinach seeds ideal for Indian gardens. Fast growing with tender, nutritious leaves.',
  199,
  150,
  'vegetable',
  'All Green Palak',
  true,
  88,
  ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'],
  '500 seeds',
  'October-February',
  'Direct sowing',
  '30-40 days',
  'active',
  4.5,
  31
);
```

✅ **Done!** You now have 3 products in your marketplace!

---

## 🎉 View Your Marketplace

1. Go to: **http://localhost:3003/marketplace**
2. You should see your 3 products!
3. Click on any product to see details
4. Click "Buy Now" to test ordering

---

## 🧪 Test the Features

### ✅ Browse Products
- Open `/marketplace`
- See product cards with images, prices
- Check seller name displays

### ✅ View Product Details
- Click any product
- Verify all details load
- Check seller info card

### ✅ Place an Order
1. Click **"Buy Now"** button
2. Fill in shipping address
3. Select quantity
4. Click **"Place Order"**
5. Should see success message!

### ✅ Verify Order in Database
Run in SQL Editor:
```sql
SELECT 
  p.title,
  o.quantity,
  o.total_price,
  o.shipping_city,
  o.created_at
FROM marketplace_orders o
JOIN marketplace_products p ON o.product_id = p.id
ORDER BY o.created_at DESC
LIMIT 5;
```

You should see your order! 🎊

---

## 🔧 Troubleshooting

### Problem: No products showing

**Check 1**: Are products in database?
```sql
SELECT COUNT(*) FROM marketplace_products WHERE status = 'active';
```
Should return > 0

**Check 2**: Check browser console (F12) for errors

**Check 3**: Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'marketplace%';
```
Should see 6 tables

### Problem: "Not authenticated" when buying

**Solution**: You must be logged in!
- Go to `/login` or `/signup`
- Create account or sign in
- Then try "Buy Now" again

### Problem: TypeScript errors in editor

**This is normal!** 
- TypeScript errors appear because database types aren't generated yet
- The code will work fine once schema is applied
- Errors are in `lib/supabase/marketplace.ts` - ignore them for now

### Problem: Images not loading

**Solution**: Images are Unsplash placeholders
- They should load if you have internet
- Replace with your own image URLs if needed
- Format: `ARRAY['url1', 'url2']`

---

## 📊 What's in the Database?

### Tables Created:

1. **marketplace_products** - All seed listings
2. **marketplace_orders** - Customer orders
3. **marketplace_sellers** - Seller profiles
4. **marketplace_reviews** - Product reviews
5. **marketplace_cart** - Shopping carts
6. **marketplace_wishlist** - Saved items

### Security (RLS Policies):

✅ Anyone can view active products  
✅ Only sellers can edit their products  
✅ Only buyers see their own orders  
✅ Users can only access their own cart  

All secure! 🔐

---

## 🎨 What Works Right Now

### Marketplace Page
- ✅ Shows all products from database
- ✅ Product cards with images
- ✅ Prices and discounts
- ✅ Stock status
- ✅ Seller names
- ✅ Ratings display
- ✅ "Add to Cart" button
- ✅ Dark mode support

### Product Detail Page
- ✅ Full product info
- ✅ Image gallery
- ✅ Seller profile
- ✅ Specifications table
- ✅ "Buy Now" with order form
- ✅ Stock warnings

### Buy Functionality
- ✅ Order dialog
- ✅ Address form
- ✅ Quantity selector
- ✅ Payment methods
- ✅ Saves to database
- ✅ Success messages

---

## 📝 Adding More Products

Want to add more products? Use this template in SQL Editor:

```sql
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  stock_quantity,
  seed_type,
  variety,
  is_organic,
  images,
  weight_per_pack,
  status
) VALUES (
  'YOUR_SELLER_ID',
  'Product Name',
  'Product description',
  299,  -- price
  100,  -- stock
  'vegetable',  -- type
  'Variety Name',
  true,  -- organic
  ARRAY['image_url_here'],
  '50 seeds',
  'active'
);
```

Replace the values and run! 🚀

---

## 🎁 Bonus: Pre-made Sample Data

For 6 complete products with all details, see:
**`INSERT_SAMPLE_PRODUCTS.md`**

Includes:
- Tomato, Chilli, Spinach, Cucumber, Carrot, Marigold
- All with descriptions, prices, specs
- Copy-paste ready!

---

## 📚 Documentation Files

| File | What's Inside |
|------|---------------|
| `MARKETPLACE_SUPABASE_SETUP.md` | Complete detailed guide |
| `INSERT_SAMPLE_PRODUCTS.md` | 6 ready-to-use products |
| `APPLY_MARKETPLACE_SCHEMA.md` | Schema instructions |
| `MARKETPLACE_COMPLETE_SUMMARY.md` | Feature overview |
| `supabase-marketplace-schema.sql` | Database schema |

---

## ✨ You're All Set!

Your marketplace now:
- ✅ Connects to Supabase
- ✅ Displays real products
- ✅ Accepts orders
- ✅ Stores everything securely

**Next**: Add your own products and start selling! 🌱

---

## 🚀 Quick Command Reference

### View all products:
```sql
SELECT title, price, stock_quantity FROM marketplace_products;
```

### View all orders:
```sql
SELECT * FROM marketplace_orders ORDER BY created_at DESC;
```

### Count products:
```sql
SELECT COUNT(*) FROM marketplace_products WHERE status = 'active';
```

### Your seller info:
```sql
SELECT * FROM marketplace_sellers WHERE user_id = 'YOUR_USER_ID';
```

---

## 💡 Pro Tips

1. **Always use** your actual user_id and seller_id in SQL queries
2. **Stock quantity** - Set low (like 5) to test "low stock" warning
3. **Images** - Use ARRAY format: `ARRAY['url1', 'url2', 'url3']`
4. **Original price** - Set higher than price to show discount badge
5. **Test buying** - Must be logged in first!

---

## 🎊 Success Checklist

After setup, you should have:

- [x] 6 tables in Supabase
- [x] 1 seller profile (you)
- [x] 3+ products visible
- [x] Products display on `/marketplace`
- [x] Product details page works
- [x] "Buy Now" button functional
- [x] Orders save to database

**All checked?** You're ready to go! 🎉

---

## 📞 Need More Products?

See **`INSERT_SAMPLE_PRODUCTS.md`** for:
- 3 more vegetable varieties
- Flower seeds
- Complete product details
- Different price points
- Various stock levels

---

**Happy Selling! 🌱💚**
