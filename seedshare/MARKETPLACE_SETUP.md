# Marketplace Setup Guide

## Quick Start

Your SeedShare Marketplace is now ready! Here's how to set it up:

### 1. Apply Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project (robnrtjlgzohlpkljyzy)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-marketplace-schema.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

Wait for the query to complete. You should see "Success" messages for all tables created.

### 2. Insert Sample Product (Optional)

To test the marketplace, insert a sample product:

```sql
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
  weight_per_pack,
  germination_rate,
  growing_season,
  sowing_method,
  harvest_time,
  status
) VALUES (
  auth.uid(),  -- This will use your current user ID
  'Organic Tomato Seeds - Pusa Ruby',
  'Premium quality organic tomato seeds with excellent germination rate. These seeds are perfect for home gardens and produce juicy, medium-sized tomatoes with rich flavor. Grown without any chemical fertilizers or pesticides.

Key Features:
- 100% Organic & Non-GMO
- High germination rate (85%+)
- Disease resistant variety
- Perfect for Indian climate
- Ideal for kitchen gardens',
  299.00,
  499.00,
  100,
  'vegetable',
  'Pusa Ruby',
  true,
  true,
  '50g (approx. 200 seeds)',
  85,
  'Summer & Monsoon',
  'Sow seeds in seedling trays with good quality potting mix. Keep soil moist but not waterlogged. Transplant seedlings after 4-5 weeks when they have 4-6 true leaves. Space plants 60cm apart.',
  '75-80 days after transplanting',
  'active'
);
```

### 3. Create a Seller Profile (Optional)

If you want to sell products, create a seller profile:

```sql
INSERT INTO marketplace_sellers (
  user_id,
  business_name,
  business_type,
  business_city,
  business_state,
  business_phone,
  is_verified,
  average_rating
) VALUES (
  auth.uid(),
  'Green Garden Seeds',
  'individual',
  'Mumbai',
  'Maharashtra',
  '+91 98765 43210',
  true,
  4.5
);
```

### 4. Visit the Marketplace

Open your browser and navigate to:
```
http://localhost:3003/marketplace
```

### 5. Test Features

#### Main Marketplace Page
- Browse products in grid layout
- Use filters (categories, type, price, discount)
- Click on products to view details

#### Sell Page
Navigate to: `http://localhost:3003/marketplace/sell`
- Fill out the sell form
- Add product details
- (Note: Image upload requires additional Supabase Storage setup)

#### Product Detail Page
- Click any product card
- View full details, pricing, seller info
- See stock status
- (Note: Buy/Cart functions require authentication)

## Features Overview

### ✅ Implemented
- [x] Amazon-style marketplace layout
- [x] Product listing with filters
- [x] Search functionality
- [x] Product cards with ratings
- [x] Sell seed form
- [x] Product detail page
- [x] Dark mode support
- [x] Responsive design
- [x] Supabase database schema
- [x] Row-level security policies

### 🔄 Coming Soon
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Payment gateway
- [ ] Order management
- [ ] Review system
- [ ] Image upload
- [ ] Seller dashboard

## Database Tables Created

1. **marketplace_products** - Product listings
2. **marketplace_orders** - Purchase orders
3. **marketplace_reviews** - Product reviews
4. **marketplace_sellers** - Seller profiles
5. **marketplace_cart** - Shopping cart
6. **marketplace_wishlist** - Saved items

## Troubleshooting

### "No products found"
- Make sure you've run the SQL schema
- Insert sample products using the SQL above
- Check Supabase logs for errors

### "Permission denied" errors
- Ensure RLS policies were created correctly
- Try logging in/out
- Check Supabase Authentication

### TypeScript errors
- All fixed! ✅
- If you see new ones, run: `pnpm build`

### Images not showing
- Default placeholder (leaf icon) will show
- To upload real images, set up Supabase Storage

## Next Steps

1. **Authentication**: Make sure users can sign up/login
2. **Storage**: Configure Supabase Storage for images
3. **Payment**: Integrate Razorpay or Stripe
4. **Email**: Set up order confirmation emails
5. **Analytics**: Track sales and views

## Documentation

For complete details, see:
- `MARKETPLACE_DOCUMENTATION.md` - Full feature documentation
- `supabase-marketplace-schema.sql` - Database schema

## Support

If you encounter issues:
1. Check Supabase SQL Editor for errors
2. Verify RLS policies are enabled
3. Check browser console for JavaScript errors
4. Ensure environment variables are set in `.env.local`

Enjoy your new marketplace! 🎉🌱
