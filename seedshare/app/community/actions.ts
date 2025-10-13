'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CommunityPost {
  id: string
  title: string
  content: string
  author_id: string
  community_id: string | null
  post_type: string
  images: string[] | null
  link_url: string | null
  upvotes: number
  downvotes: number
  comment_count: number
  view_count: number
  tags: string[] | null
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  updated_at: string
  author: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
    role: string
  }
  community: {
    id: string
    name: string
    description: string | null
  } | null
  user_vote?: {
    vote_type: 'up' | 'down'
  } | null
  is_saved?: boolean
}

export async function getCommunityPosts(sortBy: 'hot' | 'new' | 'top' | 'rising' = 'hot', communityId?: string) {
  const supabase = await createClient()

  // Get current user (optional - for vote status)
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!author_id (
        id,
        full_name,
        email,
        avatar_url,
        role
      ),
      community:communities (
        id,
        name,
        description
      )
    `)

  // Filter by community if specified
  if (communityId) {
    query = query.eq('community_id', communityId)
  }

  // Apply sorting
  switch (sortBy) {
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'top':
      query = query.order('upvotes', { ascending: false })
      break
    case 'rising':
      // Rising = good upvote ratio and recent
      query = query
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('upvotes', { ascending: false })
      break
    case 'hot':
    default:
      // Hot = combination of upvotes and recency
      query = query
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false })
      break
  }

  const { data: posts, error } = await query.limit(20)

  if (error) {
    console.error('Error fetching community posts:', error)
    return { posts: [], error: error.message }
  }

  // If user is logged in, fetch their votes and saved posts
  let postsWithUserData: any[] = posts || []
  
  if (user && posts && posts.length > 0) {
    const postIds = posts.map((p: any) => p.id)
    
    // Get user votes
    const { data: votes } = await supabase
      .from('post_votes')
      .select('post_id, vote_type')
      .eq('user_id', user.id)
      .in('post_id', postIds)
    
    // Get saved posts
    const { data: saved } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)
    
    const voteMap = new Map((votes as any)?.map((v: any) => [v.post_id, v.vote_type]) || [])
    const savedSet = new Set((saved as any)?.map((s: any) => s.post_id) || [])
    
    postsWithUserData = posts.map((post: any) => ({
      ...post,
      user_vote: voteMap.has(post.id) ? { vote_type: voteMap.get(post.id)! } : null,
      is_saved: savedSet.has(post.id)
    }))
  }

  return { posts: postsWithUserData, error: null }
}

export async function votePost(postId: string, voteType: 'up' | 'down') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('post_votes')
    .select('vote_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if ((existingVote as any).vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      if (error) return { success: false, error: error.message }
    } else {
      // Change vote
      const result: any = await supabase
        .from('post_votes')
        .update({ vote_type: voteType } as any)
        .eq('post_id', postId)
        .eq('user_id', user.id)
      const { error } = result
      
      if (error) return { success: false, error: error.message }
    }
  } else {
    // New vote
    const { error } = await supabase
      .from('post_votes')
      .insert({ post_id: postId, user_id: user.id, vote_type: voteType } as any)
    
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/community')
  return { success: true }
}

export async function savePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
    
    if (error) return { success: false, error: error.message }
  } else {
    // Save
    const { error } = await supabase
      .from('saved_posts')
      .insert({ post_id: postId, user_id: user.id } as any)
    
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/community')
  revalidatePath('/communities')
  return { success: true }
}

export async function joinCommunity(communityId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: user.id } as any)

  if (error) {
    return { success: false, error: error.message }
  }

  // Update member count
  const { data: community } = await supabase
    .from('communities')
    .select('member_count')
    .eq('id', communityId)
    .single()
  
  if (community) {
    await supabase
      .from('communities')
      .update({ member_count: ((community as any).member_count || 0) + 1 } as any)
      .eq('id', communityId)
  }

  revalidatePath('/communities')
  revalidatePath(`/communities/${communityId}`)
  return { success: true }
}

export async function leaveCommunity(communityId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Update member count
  const { data: community } = await supabase
    .from('communities')
    .select('member_count')
    .eq('id', communityId)
    .single()
  
  if (community) {
    await supabase
      .from('communities')
      .update({ member_count: Math.max(((community as any).member_count || 1) - 1, 0) } as any)
      .eq('id', communityId)
  }

  revalidatePath('/communities')
  revalidatePath(`/communities/${communityId}`)
  return { success: true }
}

export async function createCommunity(formData: {
  name: string
  description: string
  region: string
  state: string
  city?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: formData.name,
      description: formData.description,
      region: formData.region,
      state: formData.state,
      city: formData.city || null,
      created_by: user.id,
      member_count: 1
    } as any)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Auto-join creator as first member
  await supabase
    .from('community_members')
    .insert({ community_id: (data as any).id, user_id: user.id } as any)

  revalidatePath('/communities')
  return { success: true, communityId: (data as any).id }
}

export async function createPost(formData: {
  title: string
  content: string
  communityId?: string
  tags?: string[]
  images?: string[]
  linkUrl?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('community_posts')
    .insert({
      author_id: user.id,
      community_id: formData.communityId || null,
      title: formData.title,
      content: formData.content,
      tags: formData.tags || [],
      images: formData.images || [],
      link_url: formData.linkUrl || null,
      post_type: formData.images && formData.images.length > 0 ? 'image' : 'text'
    } as any)

  if (error) {
    console.error('Error creating post:', error)
    return { success: false, error: error.message }
  }

  // Award points for creating a post
  await supabase
    .from('gamification')
    .insert({
      user_id: user.id,
      action_type: 'post_created',
      points_earned: 10,
      description: 'Created a community post'
    } as any)

  // Update user points - get current points first
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single()
  
  if (profile) {
    const result: any = await supabase
      .from('profiles')
      .update({ points: ((profile as any).points || 0) + 10 } as any)
      .eq('id', user.id)
  }

  revalidatePath('/community')
  return { success: true }
}
