'use server'

/**
 * Marketplace Server Actions
 * 
 * Server-side functions for marketplace operations:
 * - Fetching products
 * - Managing products (CRUD)
 * - Creating orders
 * - Cart operations
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types
export interface MarketplaceProduct {
  id: string
  supplier_id: string
  name: string
  variety: string
  category: string
  description: string | null
  price: number
  quantity_available: number
  unit: string
  min_order_quantity: number
  max_order_quantity: number | null
  discount_percentage: number | null
  is_certified: boolean
  certification_number: string | null
  germination_rate: number | null
  purity: number | null
  images: string[]
  tags: string[]
  rating: number
  review_count: number
  is_subscription_available: boolean
  created_at: string
  updated_at: string
  supplier?: {
    full_name: string
    email: string
    avatar_url: string | null
  }
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  isCertified?: boolean
  search?: string
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'popular' | 'rating'
}

/**
 * Fetch all active marketplace products with filters
 */
export async function getMarketplaceProducts(filters?: ProductFilters) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('marketplace_products')
      .select(`
        *,
        supplier:profiles!marketplace_products_supplier_id_fkey (
          full_name,
          email,
          avatar_url
        )
      `)
      .gt('quantity_available', 0)

    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters?.isCertified) {
      query = query.eq('is_certified', true)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,variety.ilike.%${filters.search}%`)
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
        query = query.order('review_count', { ascending: false })
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
      return { products: [], error: error.message }
    }

    return { products: data as MarketplaceProduct[], error: null }
  } catch (error: any) {
    console.error('Error in getMarketplaceProducts:', error)
    return { products: [], error: error.message }
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(productId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        supplier:profiles!marketplace_products_supplier_id_fkey (
          full_name,
          email,
          avatar_url,
          phone
        )
      `)
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return { product: null, error: error.message }
    }

    return { product: data as MarketplaceProduct, error: null }
  } catch (error: any) {
    console.error('Error in getProductById:', error)
    return { product: null, error: error.message }
  }
}

/**
 * Get current user's products (for sellers)
 */
export async function getMyProducts() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { products: [], error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user products:', error)
      return { products: [], error: error.message }
    }

    return { products: data as MarketplaceProduct[], error: null }
  } catch (error: any) {
    console.error('Error in getMyProducts:', error)
    return { products: [], error: error.message }
  }
}

/**
 * Add a new product to marketplace
 */
export async function addProduct(productData: {
  name: string
  variety: string
  category: string
  description: string
  price: number
  quantity_available: number
  unit?: string
  min_order_quantity?: number
  max_order_quantity?: number
  discount_percentage?: number
  is_certified?: boolean
  certification_number?: string
  germination_rate?: number
  purity?: number
  images?: string[]
  tags?: string[]
  is_subscription_available?: boolean
}) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { product: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('marketplace_products')
      .insert({
        supplier_id: user.id,
        name: productData.name,
        variety: productData.variety,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        quantity_available: productData.quantity_available,
        unit: productData.unit || 'kg',
        min_order_quantity: productData.min_order_quantity || 1,
        max_order_quantity: productData.max_order_quantity,
        discount_percentage: productData.discount_percentage,
        is_certified: productData.is_certified || false,
        certification_number: productData.certification_number,
        germination_rate: productData.germination_rate,
        purity: productData.purity,
        images: productData.images || [],
        tags: productData.tags || [],
        is_subscription_available: productData.is_subscription_available || false,
        rating: 0,
        review_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding product:', error)
      return { product: null, error: error.message }
    }

    revalidatePath('/marketplace')
    revalidatePath('/marketplace/my-products')

    return { product: data, error: null }
  } catch (error: any) {
    console.error('Error in addProduct:', error)
    return { product: null, error: error.message }
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, productData: Partial<MarketplaceProduct>) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { product: null, error: 'Not authenticated' }
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('marketplace_products')
      .select('supplier_id')
      .eq('id', productId)
      .single()

    if (!existing || existing.supplier_id !== user.id) {
      return { product: null, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('marketplace_products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { product: null, error: error.message }
    }

    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/product/${productId}`)

    return { product: data, error: null }
  } catch (error: any) {
    console.error('Error in updateProduct:', error)
    return { product: null, error: error.message }
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('marketplace_products')
      .select('supplier_id')
      .eq('id', productId)
      .single()

    if (!existing || existing.supplier_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('marketplace_products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/marketplace')
    revalidatePath('/marketplace/my-products')

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error in deleteProduct:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create an order
 */
export async function createOrder(orderData: {
  product_id: string
  quantity: number
  shipping_address: any
}) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { order: null, error: 'Not authenticated' }
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('marketplace_products')
      .select('price, quantity_available, supplier_id, name')
      .eq('id', orderData.product_id)
      .single()

    if (productError || !product) {
      return { order: null, error: 'Product not found' }
    }

    if (product.quantity_available < orderData.quantity) {
      return { order: null, error: 'Insufficient stock' }
    }

    const totalAmount = product.price * orderData.quantity

    // Create order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items: [{
          product_id: orderData.product_id,
          product_name: product.name,
          quantity: orderData.quantity,
          unit_price: product.price,
          total_price: totalAmount
        }],
        total_amount: totalAmount,
        final_amount: totalAmount,
        shipping_address: orderData.shipping_address,
        status: 'placed'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return { order: null, error: error.message }
    }

    // Update product quantity
    await supabase
      .from('marketplace_products')
      .update({ quantity_available: product.quantity_available - orderData.quantity })
      .eq('id', orderData.product_id)

    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/product/${orderData.product_id}`)

    return { order: data, error: null }
  } catch (error: any) {
    console.error('Error in createOrder:', error)
    return { order: null, error: error.message }
  }
}

/**
 * Get product categories with counts
 */
export async function getProductCategories() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketplace_products')
      .select('category')
      .gt('quantity_available', 0)

    if (error) {
      console.error('Error fetching categories:', error)
      return { categories: [], error: error.message }
    }

    // Count categories
    const categoryCounts = data.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {})

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count: count as number
    }))

    return { categories, error: null }
  } catch (error: any) {
    console.error('Error in getProductCategories:', error)
    return { categories: [], error: error.message }
  }
}
