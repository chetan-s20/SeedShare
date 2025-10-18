import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle2,
  Store,
  Leaf,
  ArrowLeft,
  Package
} from 'lucide-react'
import { BuyNowButton } from './buy-now-button'

interface ProductData {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  original_price: number | null
  images: string[] | null
  is_organic: boolean
  is_heirloom: boolean
  is_hybrid: boolean
  rating: number | null
  review_count: number
  stock_quantity: number
  weight_per_pack: string
  seed_type: string
  variety: string | null
  germination_rate: number | null
  growing_season: string | null
  sowing_method: string | null
  harvest_time: string | null
  seller: {
    business_name: string
    average_rating: number | null
    total_sales: number
    business_city: string
    business_state: string
  } | null
}

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch product details
  const { data: product, error } = await supabase
    .from('marketplace_products')
    .select(`
      *,
      seller:marketplace_sellers!marketplace_products_seller_id_fkey(
        business_name,
        average_rating,
        total_sales,
        business_city,
        business_state
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const productData = product as unknown as ProductData

  const discountPercent = productData.original_price
    ? Math.round(((productData.original_price - productData.price) / productData.original_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 relative">
                {productData.images && productData.images[0] ? (
                  <Image
                    src={productData.images[0]}
                    alt={productData.title}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Leaf className="h-32 w-32 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnail Images */}
            {productData.images && productData.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {productData.images.slice(0, 5).map((image: string, index: number) => (
                  <Card key={index} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                      <Image
                        src={image}
                        alt={`${productData.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium capitalize">{productData.seed_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Variety:</span>
                    <span className="ml-2 font-medium">{productData.variety || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Pack Size:</span>
                    <span className="ml-2 font-medium">{productData.weight_per_pack}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Germination:</span>
                    <span className="ml-2 font-medium">{productData.germination_rate || 'N/A'}%</span>
                  </div>
                  {productData.growing_season && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Season:</span>
                      <span className="ml-2 font-medium">{productData.growing_season}</span>
                    </div>
                  )}
                  {productData.harvest_time && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Harvest Time:</span>
                      <span className="ml-2 font-medium">{productData.harvest_time}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {productData.description}
                  </p>
                </div>

                {productData.sowing_method && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Sowing Instructions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {productData.sowing_method}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {productData.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {productData.is_organic && (
                      <Badge className="bg-green-600 dark:bg-green-700">Organic</Badge>
                    )}
                    {productData.is_heirloom && (
                      <Badge className="bg-amber-600 dark:bg-amber-700">Heirloom</Badge>
                    )}
                    {productData.is_hybrid && (
                      <Badge variant="secondary">Hybrid</Badge>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(productData.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{productData.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({productData.review_count || 0} reviews)
                  </span>
                </div>

                <Separator />

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{productData.price}
                    </span>
                    {discountPercent > 0 && (
                      <>
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          ₹{productData.original_price}
                        </span>
                        <Badge variant="destructive" className="bg-red-600">
                          {discountPercent}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Stock Status */}
                <div>
                  {productData.stock_quantity > 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">In Stock</span>
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400 font-medium">
                      Out of Stock
                    </div>
                  )}
                  {productData.stock_quantity > 0 && productData.stock_quantity < 10 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Only {productData.stock_quantity} left - order soon!
                    </p>
                  )}
                </div>

                <Separator />

                {/* Quantity Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">-</Button>
                    <span className="px-4 font-medium">1</span>
                    <Button variant="outline" size="sm">+</Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <BuyNowButton 
                    productId={productData.id}
                    sellerId={productData.seller_id}
                    price={productData.price}
                    stock={productData.stock_quantity}
                    title={productData.title}
                  />
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    size="lg"
                    disabled={productData.stock_quantity === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="lg">
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </Button>
                    <Button variant="outline" className="flex-1" size="lg">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      On orders above ₹499
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      100% secure transactions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      7 days return policy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            {productData.seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-lg">{productData.seller.business_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {productData.seller.business_city}, {productData.seller.business_state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(productData.seller?.average_rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">
                      {productData.seller?.average_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {productData.seller?.total_sales || 0} products sold
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    View Seller Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
