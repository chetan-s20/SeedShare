import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { JoinCommunityButton } from '@/components/community/join-community-button'
import { CreatePostDialog } from '@/components/community/create-post-dialog'
import { PostCard } from '@/components/community/post-card'
import { getCommunityPosts } from '@/app/community/actions'

interface Props {
  params: { id: string }
  searchParams: { sort?: 'hot' | 'new' | 'top' | 'rising' }
}

export default async function CommunityDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch community details
  const { data: community, error } = await supabase
    .from('communities')
    .select(`
      *,
      creator:profiles!created_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !community) {
    notFound()
  }

  // Check if user is a member
  let isMember = false
  if (user) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', params.id)
      .eq('user_id', user.id)
      .single()
    
    isMember = !!membership
  }

  // Fetch community posts (filtered by this community)
  const sortBy = searchParams.sort || 'hot'
  const { posts } = await getCommunityPosts(sortBy, params.id)

  // Get recent members
  const { data: recentMembers } = await supabase
    .from('community_members')
    .select(`
      joined_at,
      user:profiles!user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('community_id', params.id)
    .order('joined_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Community Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {community.avatar_url && (
              <img
                src={community.avatar_url}
                alt={community.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{community.name}</CardTitle>
                  <CardDescription className="text-base">
                    {community.description || 'No description available'}
                  </CardDescription>
                </div>
                {user && (
                  <JoinCommunityButton
                    communityId={community.id}
                    isMember={isMember}
                    size="lg"
                  />
                )}
              </div>

              {/* Community Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {community.city ? `${community.city}, ` : ''}
                    {community.state}, {community.region}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{community.member_count}</span>
                  <span className="text-muted-foreground">members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Created {new Date(community.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Membership Badge */}
              {isMember && (
                <Badge variant="secondary" className="mt-4 gap-1">
                  <Users className="h-3 w-3" />
                  You're a member
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          {user && isMember && (
            <Card>
              <CardContent className="pt-6">
                <CreatePostDialog communityId={params.id} />
              </CardContent>
            </Card>
          )}

          {/* Sort Tabs */}
          <Tabs defaultValue={sortBy} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hot" asChild>
                <a href={`/communities/${params.id}?sort=hot`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Hot
                </a>
              </TabsTrigger>
              <TabsTrigger value="new" asChild>
                <a href={`/communities/${params.id}?sort=new`}>New</a>
              </TabsTrigger>
              <TabsTrigger value="top" asChild>
                <a href={`/communities/${params.id}?sort=top`}>Top</a>
              </TabsTrigger>
              <TabsTrigger value="rising" asChild>
                <a href={`/communities/${params.id}?sort=rising`}>Rising</a>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No posts yet. {isMember ? 'Be the first to post!' : 'Join to post.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {community.description || 'No description available'}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">{community.member_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(community.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Members */}
          {recentMembers && recentMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMembers.map((member: any) => (
                    <div key={member.user.id} className="flex items-center gap-3">
                      {member.user.avatar_url ? (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.full_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Rules (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be respectful and constructive</li>
                <li>• Share gardening knowledge and experiences</li>
                <li>• No spam or self-promotion</li>
                <li>• Keep posts relevant to {community.name}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
