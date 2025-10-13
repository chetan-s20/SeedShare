'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, CheckCircle2, Sprout } from 'lucide-react'
import { ProductDetailModal } from './product-detail-modal'

interface MarketplaceProduct {
  id: string
  name: string
  variety: string
  category: string
  description: string | null
  price: number
  quantity_available: number
  unit: string
  min_order_quantity: number
  is_certified: boolean
  germination_rate: number | null
  purity: number | null
  images: string[]
  rating: number
  review_count: number
  supplier_id: string
  tags?: string[]
}

interface MarketplaceProductCardProps {
  product: MarketplaceProduct
}

export function MarketplaceProductCard({ product }: MarketplaceProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-seed.jpg'

  return (
    <>
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.is_certified && (
          <Badge className="absolute top-2 right-2 bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Certified
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{product.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {product.variety} • {product.category}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center gap-4 text-sm mb-3">
          {product.germination_rate && (
            <div className="flex items-center gap-1">
              <Sprout className="w-4 h-4 text-green-600" />
              <span>{product.germination_rate}% germ</span>
            </div>
          )}
          
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)} ({product.review_count})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">
            ₹{product.price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            per {product.unit}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-1">
          {product.quantity_available} {product.unit} available • Min order: {product.min_order_quantity} {product.unit}
        </p>
      </CardContent>
      
      <CardFooter className="gap-2">
        <Button 
          className="flex-1"
          onClick={() => setIsModalOpen(true)}
        >
          View Details
        </Button>
        <Button variant="outline" size="icon">
          <Star className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>

    {/* Product Detail Modal */}
    <ProductDetailModal 
      product={product}
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
    />
  </>
  )
}
