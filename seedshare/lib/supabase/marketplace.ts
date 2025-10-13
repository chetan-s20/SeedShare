/**
 * Marketplace Database Functions
 * 
 * This file contains all Supabase queries for marketplace operations:
 * - Fetching products
 * - Creating orders
 * - Managing reviews
 * - Seller operations
 */

import { createClient } from '@/lib/supabase/client'

// Types
export interface MarketplaceProduct {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  original_price: number | null
  currency: string
  stock_quantity: number
  minimum_order: number
  seed_type: string | null
  variety: string | null
  is_organic: boolean
  is_heirloom: boolean
  is_hybrid: boolean
  germination_rate: number | null
  images: string[]
  weight_per_pack: string | null
  growing_season: string | null
  sowing_method: string | null
  harvest_time: string | null
  status: string
  views: number
  sales_count: number
  rating: number
  review_count: number
  created_at: string
  updated_at: string
  seller?: {
    id: string
    full_name: string
    location: string
    rating: number
    total_sales: number
  }
}

export interface MarketplaceOrder {
  id: string
  buyer_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  total_price: number
  status: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  phone_number: string
  payment_method: string
  payment_status: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  seedType?: string
  minPrice?: number
  maxPrice?: number
  isOrganic?: boolean
  isHeirloom?: boolean
  isHybrid?: boolean
  search?: string
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'popular' | 'rating'
}

/**
 * Fetch all active products from marketplace
 */
export async function fetchMarketplaceProducts(filters?: ProductFilters) {
  const supabase = createClient()
  
  let query = supabase
    .from('marketplace_products')
    .select(`
      *,
      seller:marketplace_sellers!marketplace_products_seller_id_fkey (
        id,
        full_name,
        location,
        rating,
        total_sales
      )
    `)
    .eq('status', 'active')

  // Apply filters
  if (filters?.seedType && filters.seedType !== 'all') {
    query = query.eq('seed_type', filters.seedType)
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters?.isOrganic) {
    query = query.eq('is_organic', true)
  }

  if (filters?.isHeirloom) {
    query = query.eq('is_heirloom', true)
  }

  if (filters?.isHybrid) {
    query = query.eq('is_hybrid', true)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,variety.ilike.%${filters.search}%`)
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'price_low':
      query = query.order('price', { ascending: true })
      break
    case 'price_high':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'popular':
      query = query.order('sales_count', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching marketplace products:', error)
    return { products: [], error }
  }

  return { products: data as MarketplaceProduct[], error: null }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(productId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketplace_products')
    .select(`
      *,
      seller:marketplace_sellers!marketplace_products_seller_id_fkey (
        id,
        user_id,
        full_name,
        location,
        rating,
        total_sales,
        phone_number,
        created_at
      )
    `)
    .eq('id', productId)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return { product: null, error }
  }

  // Increment view count
  await supabase
    .from('marketplace_products')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', productId)

  return { product: data as MarketplaceProduct, error: null }
}

/**
 * Fetch reviews for a product
 */
export async function fetchProductReviews(productId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketplace_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [], error }
  }

  return { reviews: data, error: null }
}

/**
 * Create a new order (Buy function)
 */
export async function createOrder(orderData: {
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  total_price: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  phone_number: string
  payment_method: string
  notes?: string
}) {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { order: null, error: new Error('User not authenticated') }
  }

  const { data, error } = await supabase
    .from('marketplace_orders')
    .insert({
      buyer_id: user.id,
      ...orderData,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    return { order: null, error }
  }

  // Update product sales count and stock
  const { error: updateError } = await supabase.rpc('update_product_after_order', {
    p_product_id: orderData.product_id,
    p_quantity: orderData.quantity
  })

  if (updateError) {
    console.error('Error updating product stats:', updateError)
  }

  return { order: data, error: null }
}

/**
 * Add product to cart
 */
export async function addToCart(productId: string, quantity: number) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: new Error('User not authenticated') }
  }

  // Check if product already in cart
  const { data: existing } = await supabase
    .from('marketplace_cart')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from('marketplace_cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)

    return { error }
  }

  // Insert new cart item
  const { error } = await supabase
    .from('marketplace_cart')
    .insert({
      user_id: user.id,
      product_id: productId,
      quantity
    })

  return { error }
}

/**
 * Fetch user's cart
 */
export async function fetchCart() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { cartItems: [], error: new Error('User not authenticated') }
  }

  const { data, error } = await supabase
    .from('marketplace_cart')
    .select(`
      *,
      product:marketplace_products (*)
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching cart:', error)
    return { cartItems: [], error }
  }

  return { cartItems: data, error: null }
}

/**
 * Add product to seller's listing
 */
export async function addProduct(productData: Partial<MarketplaceProduct>) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { product: null, error: new Error('User not authenticated') }
  }

  const { data, error } = await supabase
    .from('marketplace_products')
    .insert({
      seller_id: user.id,
      ...productData,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding product:', error)
    return { product: null, error }
  }

  return { product: data, error: null }
}

/**
 * Fetch seller's products
 */
export async function fetchSellerProducts(sellerId?: string) {
  const supabase = createClient()

  let userId = sellerId

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { products: [], error: new Error('User not authenticated') }
    }
    userId = user.id
  }

  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching seller products:', error)
    return { products: [], error }
  }

  return { products: data, error: null }
}

/**
 * Get or create seller profile
 */
export async function getOrCreateSellerProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { seller: null, error: new Error('User not authenticated') }
  }

  // Check if seller profile exists
  const { data: existing } = await supabase
    .from('marketplace_sellers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { seller: existing, error: null }
  }

  // Create new seller profile
  const { data, error } = await supabase
    .from('marketplace_sellers')
    .insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || 'Anonymous Seller',
      email: user.email || ''
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating seller profile:', error)
    return { seller: null, error }
  }

  return { seller: data, error: null }
}
