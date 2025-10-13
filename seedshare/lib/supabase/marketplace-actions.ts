'use server'

import { createClient } from './server'

export async function getMarketplaceProducts(filters?: {
  category?: string
  search?: string
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'popular' | 'rating'
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('marketplace_products')
    .select('*')
    .gt('quantity_available', 0)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,variety.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'price_low':
      query = query.order('price', { ascending: true })
      break
    case 'price_high':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'popular':
      query = query.order('review_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching marketplace products:', error)
    return { products: [], error: error.message }
  }

  return { products: data || [], error: null }
}

export async function getProductCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return { categories: [], error: error.message }
  }

  // Get unique categories with counts
  const categoriesMap = new Map<string, number>()
  data?.forEach((item: any) => {
    const cat = item.category
    if (cat) {
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1)
    }
  })

  const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    name,
    count
  }))

  return { categories, error: null }
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*, supplier:profiles!supplier_id(full_name, email, avatar_url, role)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}
