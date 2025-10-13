import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Leaf,
  ArrowLeftRight,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
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

  // Seeds statistics
  const { count: totalSeeds } = await supabase
    .from('seeds')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: seeds } = await supabase
    .from('seeds')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Exchange statistics
  const { count: totalExchanges } = await supabase
    .from('seed_exchanges')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)

  const { count: pendingExchanges } = await supabase
    .from('seed_exchanges')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)
    .eq('status', 'pending')

  const { count: completedExchanges } = await supabase
    .from('seed_exchanges')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', user.id)
    .eq('status', 'completed')

  // Marketplace orders (as buyer)
  const { data: myOrders } = await supabase
    .from('marketplace_orders')
    .select(`
      *,
      product:marketplace_products(title, images)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allOrders } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('buyer_id', user.id)

  const totalSpent = allOrders?.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0) || 0

  // Marketplace sales (as seller)
  const { data: mySales } = await supabase
    .from('marketplace_orders')
    .select(`
      *,
      product:marketplace_products(title, images)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allSales } = await supabase
    .from('marketplace_orders')
    .select('total_price')
    .eq('seller_id', user.id)

  const totalEarned = allSales?.reduce((sum: number, sale: any) => sum + (sale.total_price || 0), 0) || 0

  // Community posts
  const { count: totalPosts } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: recentPosts } = await supabase
    .from('community_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {(profile as any)?.full_name || user.email}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Seeds Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Seeds
              </CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalSeeds || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Seeds in your library
              </p>
            </CardContent>
          </Card>

          {/* Exchanges Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Exchanges
              </CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalExchanges || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {pendingExchanges || 0} pending, {completedExchanges || 0} completed
              </p>
            </CardContent>
          </Card>

          {/* Orders Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {myOrders?.length || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total spent: ₹{totalSpent.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Sales Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {mySales?.length || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total earned: ₹{totalEarned.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Recent Orders
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/marketplace">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Your recent marketplace purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {myOrders && myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-lg">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {order.product?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{order.total_price} • Qty: {order.quantity}
                        </p>
                      </div>
                      <Badge 
                        variant={order.status === 'delivered' ? 'default' : 'secondary'}
                        className="flex-shrink-0"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No orders yet. Visit the <Link href="/marketplace" className="text-green-600 hover:underline">Marketplace</Link> to start shopping!
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Seeds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  My Seeds
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/library">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Seeds in your collection</CardDescription>
            </CardHeader>
            <CardContent>
              {seeds && seeds.length > 0 ? (
                <div className="space-y-4">
                  {seeds.map((seed: any) => (
                    <Link href={`/library/${seed.id}`} key={seed.id}>
                      <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {seed.seed_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {seed.variety || 'No variety'} • {seed.quantity} available
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {seed.seed_type}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No seeds yet. <Link href="/library/add" className="text-green-600 hover:underline">Add your first seed!</Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          {mySales && mySales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Recent Sales
                </CardTitle>
                <CardDescription>Your marketplace sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySales.map((sale: any) => (
                    <div key={sale.id} className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-lg">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {sale.product?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{sale.total_price} • Qty: {sale.quantity}
                        </p>
                      </div>
                      <Badge variant="default" className="flex-shrink-0">
                        {sale.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Community Posts
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/community">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Your recent posts ({totalPosts || 0} total)</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPosts && recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post: any) => (
                    <Link href={`/community/${post.id}`} key={post.id}>
                      <div className="p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {post.content}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(post.created_at).toLocaleDateString()} • {post.upvotes || 0} upvotes
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No posts yet. Share your knowledge in the <Link href="/community" className="text-green-600 hover:underline">Community</Link>!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/library/add">
                  <Leaf className="h-6 w-6" />
                  Add Seed
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/marketplace">
                  <ShoppingCart className="h-6 w-6" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/marketplace/sell">
                  <Package className="h-6 w-6" />
                  Sell Seeds
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/community">
                  <Users className="h-6 w-6" />
                  Join Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
