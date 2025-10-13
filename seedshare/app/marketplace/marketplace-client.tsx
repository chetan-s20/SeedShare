'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Star, 
  Heart,
  Leaf,
  Package
} from 'lucide-react'
import { MarketplaceProduct } from '@/lib/supabase/marketplace'
import { addToCart } from '@/lib/supabase/marketplace'
import { useRouter } from 'next/navigation'

interface MarketplaceClientProps {
  products: MarketplaceProduct[]
}

export function MarketplaceClient({ products }: MarketplaceClientProps) {
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId)
    try {
      const { error } = await addToCart(productId, 1)
      if (error) {
        alert('Please login to add items to cart')
      } else {
        alert('Added to cart successfully!')
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const calculateDiscount = (price: number, originalPrice: number | null) => {
    if (!originalPrice || originalPrice <= price) return 0
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Products Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Be the first to list your seeds in the marketplace!
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
          <Link href="/marketplace/sell">
            Start Selling
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {products.map((product) => {
        const discount = calculateDiscount(product.price, product.original_price)
        const imageUrl = product.images?.[0] || '/placeholder-seed.jpg'
        
        return (
          <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-0">
              {/* Product Image */}
              <Link href={`/marketplace/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {discount > 0 && (
                      <Badge className="bg-red-600 text-white">
                        {discount}% OFF
                      </Badge>
                    )}
                    {product.is_organic && (
                      <Badge className="bg-green-600 dark:bg-green-700 text-white">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                <Link href={`/marketplace/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-green-600 dark:hover:text-green-400">
                    {product.title}
                  </h3>
                </Link>

                {/* Weight/Pack Size */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {product.weight_per_pack || 'Standard Pack'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({product.review_count || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-gray-500 dark:text-gray-500 line-through">
                      ₹{product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                {product.seller && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>Sold by: {product.seller.full_name}</span>
                    {product.seller.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.seller.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                    Only {product.stock_quantity} left in stock
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id || product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="dark:border-gray-600 dark:hover:bg-gray-700"
                    asChild
                  >
                    <Link href={`/marketplace/product/${product.id}`}>
                      <span className="sr-only">View Details</span>
                      →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
