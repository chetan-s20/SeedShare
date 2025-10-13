/**
 * Profile & User Management Functions
 * 
 * Functions for managing user profiles, preferences, and account settings
 */

import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  location: string | null
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
  // Statistics
  total_seeds_shared?: number
  total_exchanges?: number
  member_since?: string
}

export interface UserStats {
  seeds_count: number
  exchanges_count: number
  community_posts: number
  marketplace_orders: number
  marketplace_sales: number
  total_spent: number
  total_earned: number
}

export interface UserActivity {
  id: string
  type: 'seed_added' | 'exchange' | 'post' | 'order' | 'sale' | 'review'
  description: string
  created_at: string
  metadata?: any
}

/**
 * Fetch current user profile
 */
export async function fetchUserProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null, error: new Error('Not authenticated') }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return { profile: null, error }
  }

  // Get additional stats
  const { data: seedsCount } = await supabase
    .from('seeds')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: exchangesCount } = await supabase
    .from('seed_exchanges')
    .select('id', { count: 'exact', head: true })
    .eq('requester_id', user.id)

  const profile: UserProfile = {
    ...(data as any),
    email: user.email || '',
    total_seeds_shared: seedsCount || 0,
    total_exchanges: exchangesCount || 0,
    member_since: new Date((data as any).created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  return { profile, error: null }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: {
  full_name?: string
  location?: string
  bio?: string
  phone_number?: string
  avatar_url?: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: new Error('Not authenticated') }
  }

  const { error } = (await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', user.id)) as any

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Get user statistics
 */
export async function fetchUserStats(): Promise<{ stats: UserStats | null, error: any }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { stats: null, error: new Error('Not authenticated') }
  }

  // Fetch seeds count
  const { count: seedsCount } = await supabase
    .from('seeds')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch exchanges count
  const { count: exchangesCount } = await supabase
    .from('seed_exchanges')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)

  // Fetch community posts count
  const { count: postsCount } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch marketplace orders (as buyer)
  const { data: orders } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('buyer_id', user.id)

  // Fetch marketplace sales (as seller)
  const { data: sales } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('seller_id', user.id)

  const totalSpent = orders?.reduce((sum, order: any) => sum + (order.total_price || 0), 0) || 0
  const totalEarned = sales?.reduce((sum, sale: any) => sum + (sale.total_price || 0), 0) || 0

  const stats: UserStats = {
    seeds_count: seedsCount || 0,
    exchanges_count: exchangesCount || 0,
    community_posts: postsCount || 0,
    marketplace_orders: orders?.length || 0,
    marketplace_sales: sales?.length || 0,
    total_spent: totalSpent,
    total_earned: totalEarned
  }

  return { stats, error: null }
}

/**
 * Fetch user recent activity
 */
export async function fetchUserActivity(limit: number = 10): Promise<{ activities: UserActivity[], error: any }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { activities: [], error: new Error('Not authenticated') }
  }

  const activities: UserActivity[] = []

  // Fetch recent seeds
  const { data: seeds } = await supabase
    .from('seeds')
    .select('id, seed_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  seeds?.forEach((seed: any) => {
    activities.push({
      id: seed.id,
      type: 'seed_added',
      description: `Added ${seed.seed_name} to library`,
      created_at: seed.created_at
    })
  })

  // Fetch recent exchanges
  const { data: exchanges } = await supabase
    .from('seed_exchanges')
    .select('id, status, created_at')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  exchanges?.forEach((exchange: any) => {
    activities.push({
      id: exchange.id,
      type: 'exchange',
      description: `Seed exchange ${exchange.status}`,
      created_at: exchange.created_at
    })
  })

  // Fetch recent posts
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  posts?.forEach((post: any) => {
    activities.push({
      id: post.id,
      type: 'post',
      description: `Posted: ${post.title}`,
      created_at: post.created_at
    })
  })

  // Fetch recent orders
  const { data: orders } = await supabase
    .from('marketplace_orders')
    .select('id, created_at, product:marketplace_products(title)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  orders?.forEach((order: any) => {
    activities.push({
      id: order.id,
      type: 'order',
      description: `Ordered: ${order.product?.title || 'Product'}`,
      created_at: order.created_at
    })
  })

  // Sort by date and limit
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { activities: activities.slice(0, limit), error: null }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (error) {
    console.error('Error updating email:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Update user password
 */
export async function updateUserPassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error updating password:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Delete user account
 */
export async function deleteUserAccount() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: new Error('Not authenticated') }
  }

  // Delete profile (cascade will handle related data)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (error) {
    console.error('Error deleting account:', error)
    return { success: false, error }
  }

  // Sign out
  await supabase.auth.signOut()

  return { success: true, error: null }
}

/**
 * Upload profile avatar
 */
export async function uploadAvatar(file: File) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: new Error('Not authenticated') }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return { url: null, error: uploadError }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await updateUserProfile({ avatar_url: publicUrl })

  return { url: publicUrl, error: null }
}
