# Marketplace Feature - Complete Documentation

## Overview
The SeedShare Marketplace is a fully-featured e-commerce platform inspired by Amazon's layout, designed specifically for buying and selling seeds. It includes comprehensive buyer and seller functionality with Supabase backend integration.

## Features Implemented

### 1. Main Marketplace Page (`/marketplace`)
- **Amazon-style Layout**: Grid-based product display with filters sidebar
- **Search Functionality**: Search bar for finding seeds by name, variety, or category
- **Advanced Filters**:
  - Categories (Vegetables, Fruits, Herbs, Flowers, Grains)
  - Type filters (Organic, Heirloom, Hybrid, Fast Delivery)
  - Discount ranges (10%, 25%, 35%, 50% off)
  - Price ranges (₹0-₹500, ₹500-₹1,000, etc.)
  - Customer ratings (4+ stars, 3+ stars, etc.)
- **Product Cards**: Display with images, ratings, prices, discounts, badges
- **Sorting Options**: Featured, Price (Low/High), Reviews, Newest
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Mode**: Full dark theme support

### 2. Sell Page (`/marketplace/sell`)
- **Multi-section Form**:
  - Basic Information (title, description, type, variety)
  - Pricing & Stock (price, discount, quantity, pack size)
  - Growing Information (germination rate, season, sowing method)
  - Image Upload (up to 5 images)
- **Product Features**:
  - Organic/Heirloom/Hybrid checkboxes
  - Minimum order quantity
  - Harvest time details
- **Validation**: Required fields with proper error handling
- **Dark Mode Compatible**: All form elements themed

### 3. Product Detail Page (`/marketplace/product/[id]`)
- **Image Gallery**: Main image with thumbnail navigation
- **Product Information**:
  - Title, price, discount percentage
  - Rating and review count
  - Stock availability status
  - Detailed specifications
- **Purchase Options**:
  - Quantity selector
  - Buy Now button
  - Add to Cart button
  - Wishlist and Share buttons
- **Delivery Information**: Free delivery, secure payment, return policy
- **Seller Profile Card**: Business name, rating, location, total sales
- **Growing Instructions**: Detailed sowing and harvest information

## Database Schema

### Tables Created

#### 1. `marketplace_products`
Stores all product listings:
- Basic info: title, description, price, currency
- Stock management: stock_quantity, minimum_order
- Seed details: seed_type, variety, organic/heirloom/hybrid flags
- Growing info: germination_rate, growing_season, sowing_method
- Media: images array
- Metrics: views, sales_count, rating, review_count
- Status tracking: active, out_of_stock, suspended

#### 2. `marketplace_orders`
Manages purchase orders:
- Order details: buyer, seller, product, quantity, pricing
- Shipping info: address, city, state, pincode, phone
- Payment: method, status
- Order status: pending, confirmed, shipped, delivered, cancelled
- Tracking: tracking_number

#### 3. `marketplace_reviews`
Customer product reviews:
- Rating (1-5 stars)
- Review text and images
- Verified purchase flag
- Helpful count
- Links to product, buyer, and order

#### 4. `marketplace_sellers`
Seller profile information:
- Business details: name, type, address
- KYC info: GST, PAN numbers
- Banking: account details for payments
- Verification status
- Performance metrics: total_sales, average_rating

#### 5. `marketplace_cart`
Shopping cart items:
- User and product references
- Quantity
- Unique constraint per user-product pair

#### 6. `marketplace_wishlist`
Saved items for later:
- User and product references
- Unique constraint per user-product pair

### Security Features

#### Row Level Security (RLS) Policies
- **Products**: Anyone can view active products; only sellers can modify their own
- **Orders**: Buyers and sellers can only view their own orders
- **Reviews**: Public viewing; buyers can create/edit their own reviews
- **Sellers**: Verified sellers are public; users manage their own profile
- **Cart/Wishlist**: Users can only access their own items

#### Triggers & Functions
- `update_product_rating()`: Automatically recalculates product rating when reviews are added
- `update_updated_at_column()`: Automatically updates timestamps on record changes

### Indexes
Optimized for fast queries:
- Seller ID, status, seed type, creation date
- Buyer/seller for orders
- Product ID for reviews
- User ID for cart and wishlist

## File Structure

```
app/
├── marketplace/
│   ├── page.tsx                    # Main marketplace listing page
│   ├── sell/
│   │   └── page.tsx                # Sell seed form
│   └── product/
│       └── [id]/
│           └── page.tsx            # Individual product detail page
└── ...

supabase-marketplace-schema.sql     # Complete database schema
```

## Color Scheme & Design

### Light Mode
- Primary: Green (600, 700) for CTAs
- Background: White, Gray-50 for sections
- Text: Gray-900 for headings, Gray-600 for body
- Accents: Green-100 for highlights, Orange-500 for "Buy Now"

### Dark Mode
- Primary: Green (400, 700) for CTAs
- Background: Gray-900, Gray-800 for sections
- Text: White for headings, Gray-300 for body
- Accents: Green-900/30 for highlights, Orange-600 for "Buy Now"

### Component Colors
- **Organic Badge**: Green-600/700
- **Heirloom Badge**: Amber-600/700
- **Discount Badge**: Red-600
- **Rating Stars**: Yellow-400
- **Price**: Large, bold, prominent display
- **Stock Warning**: Orange for low stock, Red for out of stock

## Key Features by Page

### Marketplace Main Page
✅ Amazon-inspired grid layout
✅ Left sidebar with comprehensive filters
✅ Search bar with icon
✅ Product cards with hover effects
✅ Price display with original price strikethrough
✅ Rating stars and review count
✅ Badge system (Organic, Heirloom, Discount %)
✅ Stock status indicators
✅ "Add to Cart" buttons
✅ Sponsored/Featured product sections
✅ Sort dropdown (Featured, Price, Rating, etc.)
✅ Responsive grid (1-4 columns based on screen size)
✅ Dark mode support

### Sell Page
✅ Multi-step form layout
✅ Required field validation
✅ Image upload placeholder
✅ Checkbox filters (Organic, Heirloom, Hybrid)
✅ Price calculator (show discount percentage)
✅ Stock quantity management
✅ Growing information fields
✅ Submit/Cancel buttons
✅ Success confirmation
✅ Dark mode support

### Product Detail Page
✅ Large product image gallery
✅ Thumbnail navigation
✅ Price with discount display
✅ Rating and reviews section
✅ Quantity selector (+ / -)
✅ Buy Now (orange) and Add to Cart (green) buttons
✅ Wishlist and Share options
✅ Delivery information cards (Free delivery, Secure payment, Returns)
✅ Seller profile card with rating
✅ Detailed specifications table
✅ Growing instructions
✅ Stock availability status
✅ Dark mode support

## Integration Steps

### 1. Database Setup
```bash
# Run the SQL schema in your Supabase SQL Editor
# File: supabase-marketplace-schema.sql
```

### 2. Environment Variables
Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Insert Sample Data (Optional)
```sql
-- Sample product for testing
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
  weight_per_pack,
  status
) VALUES (
  'your-user-id',
  'Organic Tomato Seeds - Pusa Ruby',
  'High-quality organic tomato seeds with excellent germination rate. Perfect for home gardens.',
  299.00,
  499.00,
  100,
  'vegetable',
  'Pusa Ruby',
  true,
  '50g (approx 200 seeds)',
  'active'
);
```

## API Endpoints & Queries

### Fetch Products
```typescript
const { data: products } = await supabase
  .from('marketplace_products')
  .select('*, seller:marketplace_sellers(*)')
  .eq('status', 'active')
  .gt('stock_quantity', 0)
  .order('created_at', { ascending: false })
```

### Create Product (Seller)
```typescript
const { data, error } = await supabase
  .from('marketplace_products')
  .insert({
    seller_id: user.id,
    title: formData.title,
    description: formData.description,
    price: formData.price,
    // ... other fields
  })
```

### Fetch Single Product
```typescript
const { data: product } = await supabase
  .from('marketplace_products')
  .select('*, seller:marketplace_sellers(*)')
  .eq('id', productId)
  .single()
```

## Future Enhancements

### Planned Features
- [ ] Shopping cart functionality
- [ ] Checkout process with payment gateway
- [ ] Order tracking system
- [ ] Review and rating submission
- [ ] Seller dashboard (sales analytics, inventory management)
- [ ] Buyer dashboard (order history, saved addresses)
- [ ] Wishlist management
- [ ] Advanced search with filters API
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Image upload to Supabase Storage
- [ ] Seller verification process
- [ ] Bulk upload for sellers
- [ ] Recommended products (ML-based)
- [ ] Price comparison tools

### Performance Optimizations
- [ ] Implement pagination for product listings
- [ ] Add infinite scroll
- [ ] Image lazy loading optimization
- [ ] Cache frequently accessed data
- [ ] Add search indexing (full-text search)

## Testing Checklist

- [x] Marketplace page loads with products
- [x] Filters sidebar displays correctly
- [x] Product cards show all information
- [x] Sell form validates required fields
- [x] Product detail page displays correctly
- [x] Dark mode works on all pages
- [x] Responsive design works on mobile
- [ ] Database schema applied successfully
- [ ] RLS policies working correctly
- [ ] Image upload functionality
- [ ] Buy/Cart buttons functional (requires auth)

## Deployment Notes

1. Run the SQL schema in Supabase
2. Ensure RLS policies are enabled
3. Configure authentication if not already done
4. Test with sample products
5. Verify dark mode on all pages
6. Test responsive layouts

## Support & Documentation

For issues or questions:
- Check Supabase dashboard for RLS policy errors
- Verify user authentication is working
- Ensure all environment variables are set
- Check browser console for any JavaScript errors

---

**Status**: ✅ Core marketplace features implemented and ready for testing
**Last Updated**: October 13, 2025
