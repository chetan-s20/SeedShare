# 🚀 Marketplace Quick Setup Guide

## Files Created ✅

1. **`lib/supabase/marketplace-actions.ts`** - All server actions ready
2. **`app/marketplace/product-card.tsx`** - Product card component ready
3. **`MARKETPLACE_BACKEND_CONNECTION.md`** - Full documentation

---

## Quick Updates Needed

### 1. Update `app/marketplace/page.tsx`

**At the top, replace imports:**
```typescript
// ADD these imports:
import { getMarketplaceProducts, getProductCategories } from '@/lib/supabase/marketplace-actions'
import { MarketplaceProductCard } from './product-card'
```

**In the component, replace the data fetching:**
```typescript
// REMOVE:
const { data: products, error } = await supabase
  .from('marketplace_products')
  .select(...)

// REPLACE WITH:
const { products, error } = await getMarketplaceProducts({
  category: searchParams.category as string | undefined,
  search: searchParams.search as string | undefined,
  sortBy: searchParams.sort as any
})

const { categories } = await getProductCategories()
```

**In the JSX, replace MarketplaceClient:**
```typescript
// REMOVE:
<MarketplaceClient products={marketplaceProducts} />

// REPLACE WITH:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {products.map((product) => (
    <MarketplaceProductCard key={product.id} product={product} />
  ))}
</div>
```

---

### 2. Update `app/marketplace/product/[id]/page.tsx`

**Add import:**
```typescript
import { getProductById } from '@/lib/supabase/marketplace-actions'
```

**Replace data fetching:**
```typescript
// REMOVE Supabase query

// ADD:
const { product, error } = await getProductById(params.id)

if (error || !product) {
  notFound()
}
```

---

### 3. Update `app/marketplace/sell/page.tsx`

**Make it a client component and add form:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProduct } from '@/lib/supabase/marketplace-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const { product, error } = await addProduct({
      name: formData.get('name') as string,
      variety: formData.get('variety') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      quantity_available: parseInt(formData.get('quantity') as string),
      unit: formData.get('unit') as string || 'kg',
      is_certified: formData.get('certified') === 'on',
    })

    setLoading(false)

    if (error) {
      alert('Error: ' + error)
    } else {
      alert('Product listed successfully!')
      router.push('/marketplace')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">List Your Seeds</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Seed Name *</Label>
          <Input id="name" name="name" required />
        </div>

        <div>
          <Label htmlFor="variety">Variety *</Label>
          <Input id="variety" name="variety" required />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Input id="category" name="category" required 
            placeholder="e.g., Vegetables, Fruits, Grains" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₹) *</Label>
            <Input id="price" name="price" type="number" step="0.01" required />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" name="quantity" type="number" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" defaultValue="kg" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="certified" name="certified" />
            <Label htmlFor="certified">Certified Seeds</Label>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Listing...' : 'List Product'}
        </Button>
      </form>
    </div>
  )
}
```

---

## Test Checklist

1. ✅ Visit `http://localhost:3000/marketplace`
2. ✅ See products displayed
3. ✅ Try filtering by category
4. ✅ Search for products
5. ✅ Click on a product to see details
6. ✅ Go to `/marketplace/sell` and list a product
7. ✅ Verify product appears in marketplace

---

## Need Help?

Check `MARKETPLACE_BACKEND_CONNECTION.md` for full documentation including:
- All available functions
- Example usage
- Database schema
- Security details

---

**Backend is 100% ready! Just update the 3 pages above and you're done! 🎉**
