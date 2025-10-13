# Insert Sample Products into Marketplace

## Step 1: Apply Schema (if not done already)

Go to Supabase SQL Editor and run the entire `supabase-marketplace-schema.sql` file.

## Step 2: Create a Seller Profile

First, you need to create a seller profile. Run this in SQL Editor:

```sql
-- Insert a seller profile (replace with your actual user_id from auth.users)
-- To get your user_id, you can run: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

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
  'YOUR_USER_ID_HERE',  -- Replace with actual user ID
  'Green Valley Seeds',
  'seller@example.com',
  '+91-9876543210',
  'Green Valley Organic Seeds',
  'Pune, Maharashtra',
  'Certified organic seed supplier with 10+ years experience',
  4.8,
  250
);
```

## Step 3: Insert Sample Products

After creating seller profile, insert some products:

```sql
-- Get your seller_id
-- SELECT id FROM marketplace_sellers WHERE email = 'seller@example.com';

-- Insert Product 1: Organic Tomato Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  'YOUR_SELLER_ID_HERE',  -- Replace with actual seller ID
  'Organic Roma Tomato Seeds - Premium Quality',
  'High-yielding organic Roma tomato seeds perfect for Indian climate. Disease resistant and produces excellent fruit for cooking. These seeds are 100% organic and chemical-free.',
  299,
  499,
  100,
  1,
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
  '60-80 days after transplanting',
  'active',
  4.7,
  42
);

-- Insert Product 2: Hybrid Chilli Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  'YOUR_SELLER_ID_HERE',
  'Hybrid Green Chilli Seeds - High Yield F1',
  'Premium F1 hybrid green chilli seeds with excellent disease resistance. Perfect for commercial and home cultivation. Produces long, uniform fruits with great taste.',
  450,
  650,
  75,
  1,
  'vegetable',
  'Green Chilli F1',
  false,
  false,
  true,
  95,
  ARRAY['https://images.unsplash.com/photo-1583454155184-870a1f63b96e?w=500'],
  '100 seeds',
  'Year-round (avoid extreme cold)',
  'Sow in nursery, transplant after 30-35 days',
  '60-70 days after transplanting',
  'active',
  4.9,
  68
);

-- Insert Product 3: Organic Spinach Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  'YOUR_SELLER_ID_HERE',
  'Organic Palak (Spinach) Seeds - All Green',
  'Certified organic spinach seeds ideal for Indian gardens. Fast growing with tender, nutritious leaves. Perfect for continuous harvesting.',
  199,
  NULL,
  150,
  1,
  'vegetable',
  'All Green Palak',
  true,
  false,
  false,
  88,
  ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'],
  '25g (approx 500 seeds)',
  'October-February',
  'Direct sowing in rows',
  '30-40 days',
  'active',
  4.5,
  31
);

-- Insert Product 4: Cucumber Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  'YOUR_SELLER_ID_HERE',
  'Hybrid Cucumber Seeds - Long Green',
  'High yielding hybrid cucumber variety. Produces uniform, long, dark green fruits. Excellent for salads and fresh consumption.',
  350,
  500,
  50,
  1,
  'vegetable',
  'Long Green Cucumber',
  false,
  false,
  true,
  94,
  ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500'],
  '50 seeds',
  'February-April, September-November',
  'Direct sowing or transplanting',
  '50-60 days',
  'active',
  4.6,
  25
);

-- Insert Product 5: Organic Carrot Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  'YOUR_SELLER_ID_HERE',
  'Organic Nantes Carrot Seeds - Sweet & Crisp',
  'Premium organic Nantes carrot seeds. Produces sweet, cylindrical roots perfect for Indian soil. Great for home gardens and commercial cultivation.',
  399,
  599,
  80,
  1,
  'vegetable',
  'Nantes',
  true,
  true,
  false,
  85,
  ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500'],
  '10g (approx 5000 seeds)',
  'August-January',
  'Direct sowing in prepared beds',
  '90-110 days',
  'active',
  4.8,
  53
);

-- Insert Product 6: Marigold Flower Seeds
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  price,
  original_price,
  stock_quantity,
  minimum_order,
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
  review_count,
  sales_count
) VALUES (
  'YOUR_SELLER_ID_HERE',
  'Marigold Flower Seeds - Mixed Colors',
  'Beautiful mixed marigold seeds in yellow, orange, and red. Perfect for gardens, borders, and companion planting. Natural pest repellent.',
  149,
  NULL,
  8,
  1,
  'flower',
  'Mixed French Marigold',
  false,
  false,
  false,
  90,
  ARRAY['https://images.unsplash.com/photo-1526047932773-0ff4d8e35d18?w=500'],
  '100 seeds',
  'Year-round',
  'Direct sowing or transplanting',
  '60-70 days',
  'active',
  4.9,
  87,
  150
);
```

## Step 4: Verify Data

Check if products are inserted:

```sql
SELECT 
  p.id,
  p.title,
  p.price,
  p.stock_quantity,
  s.full_name as seller_name,
  p.created_at
FROM marketplace_products p
LEFT JOIN marketplace_sellers s ON p.seller_id = s.id
ORDER BY p.created_at DESC;
```

## Step 5: Get Your User ID

To find your user ID for the seller profile:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## Important Notes:

1. **Replace Placeholders**: 
   - Replace `YOUR_USER_ID_HERE` with your actual user ID from `auth.users`
   - Replace `YOUR_SELLER_ID_HERE` with the seller ID after creating seller profile

2. **Get Seller ID**:
   After inserting seller, get the ID:
   ```sql
   SELECT id FROM marketplace_sellers WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Images**: 
   - Sample products use Unsplash images
   - Replace with your own image URLs if needed
   - Images should be in array format: `ARRAY['url1', 'url2']`

4. **Stock Quantities**:
   - Product 6 (Marigold) has only 8 in stock to test "low stock" warning
   - Adjust as needed for testing

## Next Steps:

After inserting data:
1. Refresh your marketplace page
2. You should see all 6 products
3. Click on any product to see details
4. Try "Add to Cart" functionality
5. Test filters and search

## Troubleshooting:

**If products don't appear:**
- Check if tables exist: `SELECT * FROM information_schema.tables WHERE table_name LIKE 'marketplace%';`
- Verify RLS policies allow SELECT: `SELECT * FROM marketplace_products WHERE status = 'active';`
- Check browser console for errors

**If you get "row level security" errors:**
- Make sure RLS policies were created with the schema
- The schema includes policies that allow anyone to view active products
