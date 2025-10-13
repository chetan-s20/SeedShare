import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Leaf,
  ArrowLeftRight,
  Package,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { ProfileEditForm } from './profile-edit-form'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user stats
  const { count: seedsCount } = await supabase
    .from('seeds')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  const { count: exchangesCount } = await supabase
    .from('seed_exchanges')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)

  const { count: postsCount } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  // Get recent seeds
  const { data: recentSeeds } = await supabase
    .from('seeds')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent exchanges
  const { data: recentExchanges } = await supabase
    .from('seed_exchanges')
    .select(`
      *,
      seed:seeds(seed_name)
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get marketplace stats
  const { data: orders } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('buyer_id', user.id)

  const { data: sales } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('seller_id', user.id)

  const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0) || 0
  const totalEarned = sales?.reduce((sum: number, sale: any) => sum + (sale.total_price || 0), 0) || 0

  const profileData = profile as any;
  
  const initials = (profileData?.full_name || user.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Unknown'

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 border-4 border-green-600">
                  <AvatarImage src={profileData?.avatar_url || ''} alt={profileData?.full_name || ''} />
                  <AvatarFallback className="text-2xl bg-green-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Badge className="mt-4 bg-green-600" variant="default">
                  {profileData?.role || 'Gardener'}
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profileData?.full_name || 'Anonymous User'}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      {profileData?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profileData.location}
                        </div>
                      )}
                      {profileData?.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {profileData.phone_number}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Member since {memberSince}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profileData?.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {profileData.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {seedsCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Seeds</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {exchangesCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Exchanges</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {postsCount || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {orders?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seeds">My Seeds</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marketplace Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Marketplace Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                    <span className="font-bold text-lg">{orders?.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                    <span className="font-bold text-lg">{sales?.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-bold text-lg text-red-600">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Earned</span>
                    <span className="font-bold text-lg text-green-600">₹{totalEarned.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Community Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Posts Created</span>
                    <span className="font-bold text-lg">{postsCount || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Seeds Shared</span>
                    <span className="font-bold text-lg">{seedsCount || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Exchanges</span>
                    <span className="font-bold text-lg">{exchangesCount || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="font-bold text-sm">{memberSince}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Seeds Tab */}
          <TabsContent value="seeds">
            <Card>
              <CardHeader>
                <CardTitle>My Seed Collection</CardTitle>
                <CardDescription>Seeds you've added to the library</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSeeds && recentSeeds.length > 0 ? (
                  <div className="space-y-4">
                    {recentSeeds.map((seed: any) => (
                      <Link href={`/library/${seed.id}`} key={seed.id}>
                        <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{seed.seed_name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {seed.variety || 'No variety specified'} • {seed.quantity} available
                            </p>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {new Date(seed.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No seeds added yet. Visit the <Link href="/library" className="text-green-600 hover:underline">Seed Library</Link> to add some!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions across SeedShare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Exchanges */}
                  {recentExchanges && recentExchanges.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Recent Exchanges
                      </h3>
                      {recentExchanges.map((exchange: any) => (
                        <div key={exchange.id} className="flex items-start gap-3 p-3 border-l-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10 rounded-r mb-2">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              Exchange request for <span className="font-semibold">{exchange.seed?.seed_name || 'seed'}</span>
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Status: <Badge variant={exchange.status === 'completed' ? 'default' : 'secondary'}>{exchange.status}</Badge> • {new Date(exchange.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!recentSeeds || recentSeeds.length === 0) && (!recentExchanges || recentExchanges.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No recent activity. Start by adding seeds or making exchanges!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit">
            <ProfileEditForm profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
