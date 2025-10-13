import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sprout,
  ShoppingBag,
  Users,
  MessageSquare,
  Award,
  TrendingUp,
  Shield,
  Truck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Video,
  Leaf,
  MapPin,
  Star,
  CheckCircle2,
  Zap,
  Globe,
  Heart,
  Package,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  // Fetch REAL data from database
  const supabase = await createClient();
  
  // Get actual stats from database
  const [
    { count: totalSeeds },
    { count: totalUsers },
    { count: totalCommunities },
    { data: recentSeeds }
  ] = await Promise.all([
    supabase.from('seeds').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('communities').select('*', { count: 'exact', head: true }),
    supabase
      .from('seeds')
      .select(`
        *,
        owner:profiles(full_name, city, state)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const features = [
    {
      icon: Sprout,
      title: 'Seed Library',
      description: 'Share and exchange seeds with fellow farmers and gardeners. Track provenance with QR codes.',
      href: '/library',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      icon: ShoppingBag,
      title: 'Certified Marketplace',
      description: 'Buy certified seeds from verified suppliers. Bulk orders, subscriptions, and discounts available.',
      href: '/marketplace',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: Users,
      title: 'Community Groups',
      description: 'Join localized communities, share success stories, and learn from experienced growers.',
      href: '/community',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      icon: MessageSquare,
      title: 'Q&A Forum',
      description: 'Ask questions, share knowledge, and get answers from experts and community members.',
      href: '/knowledge',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
      icon: Video,
      title: 'Expert Consultation',
      description: 'Book one-on-one sessions with agricultural experts and get personalized guidance.',
      href: '/experts',
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Earn points, badges, and climb the leaderboard by actively participating in the community.',
      href: '/leaderboard',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'All marketplace seeds are certified and comply with Seeds Act regulations.',
    },
    {
      icon: Truck,
      title: 'Reliable Delivery',
      description: 'Multiple logistics partners ensure timely delivery with full tracking support.',
    },
    {
      icon: TrendingUp,
      title: 'Volume Discounts',
      description: 'Special pricing for bulk orders to support farming at scale.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get instant answers to gardening questions using our AI assistant.',
    },
  ]

  // Use REAL stats or show actual numbers
  const stats = [
    { label: 'Seeds Available', value: totalSeeds || 0, icon: Sprout },
    { label: 'Active Farmers', value: totalUsers || 0, icon: Users },
    { label: 'Communities', value: totalCommunities || 0, icon: MessageSquare },
    { label: 'Platform Features', value: 6, icon: Award },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section - Subtle & Aesthetic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 md:py-28 lg:py-36">
        {/* Subtle Background Gradients */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-green-200/40 to-emerald-300/40 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/30 to-teal-200/30 dark:from-blue-900/15 dark:to-teal-900/15 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="flex flex-col space-y-8 max-w-2xl">
              <div className="space-y-6">
                <Badge className="w-fit bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" variant="secondary">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {totalUsers && totalUsers > 0 ? `${totalUsers.toLocaleString()} Active Farmers` : 'Growing Community Platform'}
                </Badge>
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl leading-tight">
                  Grow Better.
                  <span className="block mt-2 text-green-600 dark:text-green-500">
                    Together.
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 md:text-xl leading-relaxed">
                  A complete ecosystem for sharing seeds, buying certified varieties, and connecting with farming communities worldwide.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all text-base px-6" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-base px-6" asChild>
                  <Link href="/library">
                    <Sprout className="mr-2 h-4 w-4" />
                    Browse Seeds
                  </Link>
                </Button>
              </div>

              {/* Platform Highlights */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span>Free to Join</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span>Certified Seeds</span>
                </div>
              </div>
            </div>

            {/* Right Content - Platform Features Grid */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4 h-[480px]">
                {/* Seed Library Feature */}
                <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="h-full flex flex-col justify-center">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center border border-green-200 dark:border-green-800 mb-3">
                      <Sprout className="h-6 w-6 text-green-600 dark:text-green-500" />
                    </div>
                    <CardTitle className="text-base text-gray-900 dark:text-white mb-2">Seed Library</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Browse {totalSeeds || 0} seeds from farmers worldwide. Share, exchange, and preserve heritage varieties.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* AI Assistant Feature */}
                <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="h-full flex flex-col justify-center">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 mb-3">
                      <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
                    </div>
                    <CardTitle className="text-base text-gray-900 dark:text-white mb-2">AI Assistant</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Get instant farming advice 24/7. Ask about crops, pests, soil, and more.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Communities Feature */}
                <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="h-full flex flex-col justify-center">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 flex items-center justify-center border border-purple-200 dark:border-purple-800 mb-3">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                    </div>
                    <CardTitle className="text-base text-gray-900 dark:text-white mb-2">Communities</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Join {totalCommunities || 0} local farming groups. Share knowledge and connect with neighbors.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Marketplace Feature */}
                <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader className="h-full flex flex-col justify-center">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center border border-blue-200 dark:border-blue-800 mb-3">
                      <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                    </div>
                    <CardTitle className="text-base text-gray-900 dark:text-white mb-2">Marketplace</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Buy certified seeds from verified suppliers. Bulk orders and subscriptions available.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Stats Section */}
      <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 mx-auto">
                    <Icon className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Refined & Subtle */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0" variant="secondary">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Complete Platform
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-3">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              From seed sharing to expert consultations, we've got you covered
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link 
                  key={feature.title} 
                  href={feature.href}
                >
                  <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900">
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-4 text-lg text-gray-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-500 font-medium group-hover:translate-x-1 transition-all">
                        Explore
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Seeds from Library */}
      {recentSeeds && recentSeeds.length > 0 && (
        <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  Recently Added Seeds
                </h2>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                  Explore the latest seeds shared by our community
                </p>
              </div>
              <Button asChild variant="outline" className="border border-gray-300 dark:border-gray-700">
                <Link href="/library">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentSeeds.map((seed: any) => (
                <Link key={seed.id} href={`/library/${seed.id}`}>
                  <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        {seed.images && seed.images.length > 0 ? (
                          <img 
                            src={seed.images[0]} 
                            alt={seed.common_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Leaf className="h-14 w-14 text-green-600 dark:text-green-500" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1 text-gray-900 dark:text-white">
                          {seed.common_name}
                        </CardTitle>
                        <div className="flex gap-1 flex-shrink-0">
                          {seed.is_organic && (
                            <Badge className="text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border-0">
                              Organic
                            </Badge>
                          )}
                          {seed.is_heirloom && (
                            <Badge className="text-xs bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-0">
                              Heirloom
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-1 text-sm">
                        {seed.variety}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        <span className="truncate">
                          {seed.owner?.city && seed.owner?.state 
                            ? `${seed.owner.city}, ${seed.owner.state}`
                            : seed.origin}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{seed.category}</span>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-700">
                          {seed.quantity} {seed.unit}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0" variant="secondary">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-3">
              How SeedShare Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border-4 border-green-200 dark:border-green-800 mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500">1</span>
                </div>
                <CardTitle className="text-lg">Create Your Account</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Sign up for free and complete your farmer profile with your location and farming interests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center border-4 border-blue-200 dark:border-blue-800 mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">2</span>
                </div>
                <CardTitle className="text-lg">Browse & Connect</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Explore seed library, join local communities, and connect with farmers in your region
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center border-4 border-purple-200 dark:border-purple-800 mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-500">3</span>
                </div>
                <CardTitle className="text-lg">Share & Grow</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Exchange seeds, buy certified varieties, get AI advice, and grow your farming knowledge
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section - Subtle & Clean */}
      <section className="bg-gray-50/50 dark:bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0" variant="secondary">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Trusted by Thousands
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-3">
              Why Choose SeedShare?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Built with farmers and gardeners in mind
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              const colors = [
                'from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
                'from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
                'from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
                'from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'
              ]
              const iconColors = [
                'text-green-600 dark:text-green-500',
                'text-blue-600 dark:text-blue-500',
                'text-purple-600 dark:text-purple-500',
                'text-orange-600 dark:text-orange-500'
              ]
              return (
                <Card key={benefit.title} className="group hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800 hover:-translate-y-1 bg-white dark:bg-gray-900">
                  <CardHeader className="text-center space-y-4">
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors[index]} group-hover:scale-105 transition-transform border border-gray-200 dark:border-gray-800`}>
                      <Icon className={`h-7 w-7 ${iconColors[index]}`} />
                    </div>
                    <CardTitle className="text-base text-gray-900 dark:text-white">{benefit.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Detailed Information */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700" variant="secondary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-3">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to succeed in agriculture
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* AI-Powered Assistant */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">AI-Powered Advice</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Get instant answers to farming questions with our advanced AI assistant. Ask about crop diseases, soil health, pest control, irrigation, and more - available 24/7 in multiple languages.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">24/7 Available</Badge>
                  <Badge variant="outline" className="text-xs">Multi-language</Badge>
                  <Badge variant="outline" className="text-xs">Expert Knowledge</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Seed Exchange Network */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border border-green-200 dark:border-green-800 flex-shrink-0">
                    <Sprout className="h-6 w-6 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Seed Exchange Network</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Share and discover rare, heirloom, and organic seeds. Track seed provenance with QR codes, exchange with verified farmers, and preserve agricultural biodiversity.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">QR Tracking</Badge>
                  <Badge variant="outline" className="text-xs">Verified Farmers</Badge>
                  <Badge variant="outline" className="text-xs">Heritage Seeds</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Certified Marketplace */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800 flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Certified Marketplace</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Purchase certified seeds from verified suppliers. Bulk ordering, subscriptions, volume discounts, and guaranteed quality compliance with Seeds Act regulations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Certified Quality</Badge>
                  <Badge variant="outline" className="text-xs">Bulk Orders</Badge>
                  <Badge variant="outline" className="text-xs">Secure Payment</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Local Communities */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center border border-purple-200 dark:border-purple-800 flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Local Communities</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Join region-specific farming communities. Share experiences, learn from neighbors, organize local events, and build strong agricultural networks in your area.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Local Groups</Badge>
                  <Badge variant="outline" className="text-xs">Event Planning</Badge>
                  <Badge variant="outline" className="text-xs">Knowledge Sharing</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Subtle & Elegant */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-green-50/40 to-emerald-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 border-t border-gray-200 dark:border-gray-800">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border-0 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Free Forever • No Credit Card Required
            </Badge>
            
            <h2 className="text-3xl font-bold md:text-5xl leading-tight text-gray-900 dark:text-white">
              Ready to Start Your Farming Journey?
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join 10,000+ farmers and gardeners already growing better together. 
              Start sharing, learning, and thriving today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all px-6 group" 
                asChild
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-6" 
                asChild
              >
                <Link href="/library">
                  <Sprout className="mr-2 h-4 w-4" />
                  Browse Seeds
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span>No Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
