import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Store, 
  Star, 
  TrendingUp,
  Leaf,
  Package,
  CheckCircle2,
  Heart
} from 'lucide-react'
import { MarketplaceClient } from './marketplace-client'
import { MarketplaceProduct } from '@/lib/supabase/marketplace'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  // Fetch marketplace products
  const { data: products, error } = await supabase
    .from('marketplace_products')
    .select(`
      *,
      seller:marketplace_sellers!marketplace_products_seller_id_fkey(
        business_name,
        average_rating
      )
    `)
    .eq('status', 'active')
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(20)

  const marketplaceProducts: MarketplaceProduct[] = products || []

  // Sample categories for filters
  const categories = [
    { name: 'Vegetables', count: 450, icon: '🥬' },
    { name: 'Fruits', count: 230, icon: '🍎' },
    { name: 'Herbs', count: 180, icon: '🌿' },
    { name: 'Flowers', count: 320, icon: '🌸' },
    { name: 'Grains', count: 150, icon: '🌾' },
  ]

  const filters = [
    { name: 'Organic', count: 125 },
    { name: 'Heirloom', count: 89 },
    { name: 'Hybrid', count: 203 },
    { name: 'Fast Delivery', count: 67 },
  ]

  const discounts = [
    '10% Off or more',
    '25% Off or more',
    '35% Off or more',
    '50% Off or more',
  ]

  const priceRanges = [
    '₹0 - ₹500',
    '₹500 - ₹1,000',
    '₹1,000 - ₹2,000',
    '₹2,000 - ₹5,000',
    '₹5,000+',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-gray-800 dark:to-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Seed Marketplace</h1>
              <p className="text-green-50 dark:text-gray-300">
                Buy certified seeds directly from trusted sellers across India
              </p>
            </div>
            <Button 
              asChild
              size="lg" 
              className="bg-white text-green-600 hover:bg-green-50 dark:bg-green-700 dark:text-white dark:hover:bg-green-600"
            >
              <Link href="/marketplace/sell">
                <Store className="mr-2 h-5 w-5" />
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="search"
                placeholder="Search seeds by name, variety, or category..."
                className="pl-10 h-12 dark:bg-gray-800 dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <Button variant="outline" size="lg" className="gap-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <Filter className="h-5 w-5" />
              All Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Category Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.name} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{category.icon} {category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({category.count})</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Type Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filters.map((filter) => (
                    <label key={filter.name} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{filter.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({filter.count})</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Discount Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Discount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {discounts.map((discount) => (
                    <label key={discount} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{discount}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Price Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Price</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <input type="radio" name="price" className="rounded-full" />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Rating */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[4, 3, 2, 1].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <input type="checkbox" className="rounded" />
                      <div className="flex items-center gap-1">
                        {[...Array(stars)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content - Product Grid */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Results
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  1-{marketplaceProducts.length} of over 1,200 results for "seeds"
                </p>
              </div>
              <select className="border dark:border-gray-700 dark:bg-gray-800 rounded-md px-4 py-2 text-sm">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Avg. Customer Review</option>
                <option>Newest Arrivals</option>
              </select>
            </div>

            {/* Sponsored Banner */}
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <Badge variant="secondary" className="text-xs">Limited Time Deal</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-1 dark:text-white">Special Seed Collection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Save up to 50% on premium organic seeds</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                      View Deals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <MarketplaceClient products={marketplaceProducts} />
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
