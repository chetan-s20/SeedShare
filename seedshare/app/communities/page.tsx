import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { JoinCommunityButton } from '@/components/community/join-community-button'
import { CreateCommunityDialog } from '@/components/community/create-community-dialog'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Community {
  id: string
  name: string
  description: string | null
  region: string
  state: string
  city: string | null
  avatar_url: string | null
  member_count: number
  created_at: string
  is_member?: boolean
}

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; region?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all communities with optional search
  let query = supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.region) {
    query = query.eq('region', params.region)
  }

  const { data: communities, error } = await query

  if (error) {
    console.error('Error fetching communities:', error)
  }

  // If user is logged in, check which communities they're a member of
  let communitiesWithMembership: Community[] = communities || []
  
  if (user && communities) {
    const { data: memberships } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id)
    
    const membershipSet = new Set(memberships?.map(m => m.community_id) || [])
    
    communitiesWithMembership = communities.map(c => ({
      ...c,
      is_member: membershipSet.has(c.id)
    }))
  }

  // Get unique regions for filter
  const regions = [...new Set(communities?.map(c => c.region) || [])]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">
            Connect with local gardeners and seed enthusiasts
          </p>
        </div>
        {user && <CreateCommunityDialog />}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search communities..."
            className="pl-10"
            defaultValue={params.search}
            name="search"
          />
        </div>
        <select
          name="region"
          className="px-4 py-2 border rounded-md bg-background"
          defaultValue={params.region}
        >
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communitiesWithMembership.map(community => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/communities/${community.id}`}>
                    <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                      {community.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mt-2 line-clamp-2">
                    {community.description || 'No description available'}
                  </CardDescription>
                </div>
                {community.avatar_url && (
                  <img
                    src={community.avatar_url}
                    alt={community.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {community.city ? `${community.city}, ` : ''}
                    {community.state}, {community.region}
                  </span>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{community.member_count}</span>
                  <span className="text-muted-foreground">members</span>
                </div>

                {/* Membership Status */}
                <div className="flex items-center justify-between gap-2">
                  {community.is_member ? (
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      Member
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not a member</span>
                  )}
                  
                  {user && (
                    <JoinCommunityButton
                      communityId={community.id}
                      isMember={community.is_member || false}
                    />
                  )}
                </div>

                {/* View Button */}
                <Link href={`/communities/${community.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    View Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!communitiesWithMembership.length && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No communities found</h3>
          <p className="text-muted-foreground mb-4">
            {params.search
              ? 'Try adjusting your search filters'
              : 'Be the first to create a community!'}
          </p>
          {user && <CreateCommunityDialog />}
        </div>
      )}
    </div>
  )
}
