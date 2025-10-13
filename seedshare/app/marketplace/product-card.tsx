'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, CheckCircle2, Leaf } from 'lucide-react'
import { MarketplaceProduct } from '@/lib/supabase/marketplace-actions'

interface MarketplaceProductCardProps {
  product: MarketplaceProduct
}

export function MarketplaceProductCard({ product }: MarketplaceProductCardProps) {
  const discount = product.discount_percentage || 0
  const imageUrl = product.images?.[0] || '/placeholder-seed.jpg'
  const finalPrice = discount > 0 
    ? product.price * (1 - discount / 100) 
    : product.price

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      <CardContent className="p-0">
        {/* Product Image */}
        <Link href={`/marketplace/product/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge className="bg-red-600 text-white">
                  {discount}% OFF
                </Badge>
              )}
              {product.is_certified && (
                <Badge className="bg-blue-600 dark:bg-blue-700 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              )}
            </div>

            {/* Stock Badge */}
            {product.quantity_available < 10 && product.quantity_available > 0 && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="destructive">
                  Only {product.quantity_available} left
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/marketplace/product/${product.id}`}>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              {product.variety}
            </p>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-1 mb-3 flex-wrap">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /{product.unit}
                </span>
              </div>
              {discount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quality Indicators */}
          {(product.germination_rate || product.purity) && (
            <div className="flex gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
              {product.germination_rate && (
                <div>
                  <span className="font-medium">Germination:</span> {product.germination_rate}%
                </div>
              )}
              {product.purity && (
                <div>
                  <span className="font-medium">Purity:</span> {product.purity}%
                </div>
              )}
            </div>
          )}

          {/* Supplier Info */}
          {product.supplier && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Sold by: <span className="font-medium">{product.supplier.full_name}</span>
            </p>
          )}

          {/* Action Button */}
          <Link href={`/marketplace/product/${product.id}`} className="block">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
