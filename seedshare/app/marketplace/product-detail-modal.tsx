'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Star, 
  CheckCircle2, 
  Sprout, 
  ShoppingCart, 
  Minus, 
  Plus,
  Package,
  Truck,
  Shield,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

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

interface ProductDetailModalProps {
  product: MarketplaceProduct
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-seed.jpg'

  const totalPrice = product.price * quantity

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num >= product.min_order_quantity && num <= product.quantity_available) {
      setQuantity(num)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.quantity_available) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > product.min_order_quantity) {
      setQuantity(quantity - 1)
    }
  }

  const handleBuyNow = async () => {
    setIsAddingToCart(true)
    try {
      // TODO: Implement buy now functionality
      // This should redirect to checkout or payment page
      toast.success(`Processing order for ${quantity} ${product.unit} of ${product.name}`)
      console.log('Buy now:', { productId: product.id, quantity, totalPrice })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, redirect to checkout
      // router.push(`/checkout?product=${product.id}&quantity=${quantity}`)
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Failed to process order. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      // TODO: Implement add to cart functionality
      toast.success(`Added ${quantity} ${product.unit} to cart`)
      console.log('Add to cart:', { productId: product.id, quantity })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>
            {product.variety} • {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.is_certified && (
                <Badge className="absolute top-3 right-3 bg-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Certified
                </Badge>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-green-600">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">
                  per {product.unit}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.quantity_available} {product.unit} available
              </p>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              {product.germination_rate && (
                <div className="flex items-center gap-2 text-sm">
                  <Sprout className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold">{product.germination_rate}%</p>
                    <p className="text-xs text-muted-foreground">Germination</p>
                  </div>
                </div>
              )}

              {product.purity && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">{product.purity}%</p>
                    <p className="text-xs text-muted-foreground">Purity</p>
                  </div>
                </div>
              )}

              {product.rating > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="font-semibold">{product.rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{product.review_count} reviews</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Min {product.min_order_quantity}</p>
                  <p className="text-xs text-muted-foreground">Minimum order</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity ({product.unit})</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= product.min_order_quantity}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  min={product.min_order_quantity}
                  max={product.quantity_available}
                  className="w-24 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.quantity_available}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum: {product.min_order_quantity} {product.unit} • Maximum: {product.quantity_available} {product.unit}
              </p>
            </div>

            {/* Total Price */}
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {quantity} {product.unit} × ₹{product.price.toFixed(2)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleBuyNow}
                disabled={isAddingToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? 'Processing...' : 'Buy Now'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                Add to Cart
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold mb-1">Fast Delivery</p>
                <p className="text-muted-foreground">
                  Estimated delivery in 3-5 business days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold mb-1">Quality Guarantee</p>
                <p className="text-muted-foreground">
                  100% genuine products with quality assurance
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
