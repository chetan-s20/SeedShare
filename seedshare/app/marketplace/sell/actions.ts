'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMarketplaceProduct(formData: {
  name: string
  variety: string
  category: string
  description: string
  price: number
  quantity_available: number
  unit: string
  min_order_quantity: number
  germination_rate?: number
  images?: string[]
  tags?: string[]
}) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { 
      success: false, 
      error: 'You must be logged in to list products' 
    }
  }

  // Insert product into database
  const { data, error } = (await supabase
    .from('marketplace_products')
    .insert({
      supplier_id: user.id,
      name: formData.name,
      variety: formData.variety || 'Standard',
      category: formData.category,
      description: formData.description,
      price: formData.price,
      quantity_available: formData.quantity_available,
      unit: formData.unit || 'kg',
      min_order_quantity: formData.min_order_quantity || 1,
      germination_rate: formData.germination_rate || null,
      images: formData.images || [],
      tags: formData.tags || [],
      rating: 0,
      review_count: 0,
      is_certified: false,
      is_subscription_available: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .select()
    .single()) as any

  if (error) {
    console.error('Error creating product:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create product. Please check your permissions.' 
    }
  }

  // Revalidate marketplace page
  revalidatePath('/marketplace')

  return { 
    success: true, 
    product: data,
    message: 'Product listed successfully!' 
  }
}

export async function getMyProducts() {
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
    console.error('Error fetching products:', error)
    return { products: [], error: error.message }
  }

  return { products: data || [], error: null }
}

export async function updateMarketplaceProduct(productId: string, updates: any) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = (await supabase
    .from('marketplace_products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', productId)
    .eq('supplier_id', user.id) // Ensure user owns the product
    .select()
    .single()) as any

  if (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/marketplace')
  revalidatePath(`/marketplace/${productId}`)

  return { success: true, product: data }
}

export async function deleteMarketplaceProduct(productId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('marketplace_products')
    .delete()
    .eq('id', productId)
    .eq('supplier_id', user.id) // Ensure user owns the product

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/marketplace')

  return { success: true }
}
