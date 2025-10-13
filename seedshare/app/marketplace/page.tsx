import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Sprout
} from 'lucide-react'
import { getMarketplaceProducts, getProductCategories } from '@/lib/supabase/marketplace-actions'
import { MarketplaceProductCard } from './product-card'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get filter parameters
  const category = searchParams.category as string | undefined
  const search = searchParams.search as string | undefined
  const sortBy = searchParams.sort as 'price_low' | 'price_high' | 'newest' | 'popular' | 'rating' | undefined

  // Fetch products with filters
  const { products, error } = await getMarketplaceProducts({
    category,
    search,
    sortBy: sortBy || 'newest'
  })

  // Fetch categories
  const { categories } = await getProductCategories()

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Sprout className="h-10 w-10" />
                Seed Marketplace
              </h1>
              <p className="text-green-50 dark:text-gray-200 text-lg">
                Buy certified seeds directly from trusted suppliers across India
              </p>
              <div className="mt-4 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Certified Seeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Verified Sellers</span>
                </div>
              </div>
            </div>
            <Button 
              asChild
              size="lg" 
              className="bg-white text-green-600 hover:bg-green-50 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
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
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <form method="get" className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search seeds by name, variety, or category..."
                className="pl-10 h-12 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <Button type="submit" size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Category Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link 
                    href="/marketplace"
                    className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${!category ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  >
                    <span className="text-sm">All Categories</span>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/marketplace?category=${cat.name}`}
                      className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${category === cat.name ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({cat.count})</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Sort Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sort By</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'popular', label: 'Most Popular' },
                    { value: 'rating', label: 'Highest Rated' },
                  ].map((sort) => (
                    <Link
                      key={sort.value}
                      href={`/marketplace?${category ? `category=${category}&` : ''}sort=${sort.value}`}
                      className={`block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm ${sortBy === sort.value || (!sortBy && sort.value === 'newest') ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      {sort.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Quality Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 dark:text-gray-300">
                  All seeds are verified for quality, germination rate, and certification. Buy with confidence!
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content - Products */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {category ? `${category} Seeds` : 'All Seeds'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {products.length} products found
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Products
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </Card>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {search ? `No products match your search "${search}"` : 'Be the first to list your seeds!'}
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                  <Link href="/marketplace/sell">
                    <Store className="mr-2 h-4 w-4" />
                    Start Selling
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <MarketplaceProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
