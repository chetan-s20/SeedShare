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
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Sprout,
      title: 'Seed Library',
      description: 'Share and exchange seeds with fellow farmers and gardeners. Track provenance with QR codes.',
      href: '/library',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: ShoppingBag,
      title: 'Certified Marketplace',
      description: 'Buy certified seeds from verified suppliers. Bulk orders, subscriptions, and discounts available.',
      href: '/marketplace',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      title: 'Community Groups',
      description: 'Join localized communities, share success stories, and learn from experienced growers.',
      href: '/community',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: MessageSquare,
      title: 'Q&A Forum',
      description: 'Ask questions, share knowledge, and get answers from experts and community members.',
      href: '/knowledge',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Video,
      title: 'Expert Consultation',
      description: 'Book one-on-one sessions with agricultural experts and get personalized guidance.',
      href: '/experts',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Earn points, badges, and climb the leaderboard by actively participating in the community.',
      href: '/leaderboard',
      color: 'bg-yellow-100 text-yellow-600',
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

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Seeds Exchanged', value: '50,000+' },
    { label: 'Communities', value: '500+' },
    { label: 'Expert Consultations', value: '2,000+' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-6">
              <Badge className="w-fit" variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                Now Live!
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Your Complete
                <span className="block text-green-600">Seed Ecosystem</span>
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Share seeds, buy certified varieties, connect with communities, and grow your
                knowledge. Everything farmers and gardeners need in one place.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/library">Explore Seed Library</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-blue-600/20 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="h-12 w-12 rounded-lg bg-green-100" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-green-600 md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Everything You Need to Grow
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools and resources for modern farming and gardening
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Why Choose SeedShare?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with farmers and gardeners in mind
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Start Your Journey?</h2>
          <p className="mt-4 text-lg text-green-100">
            Join thousands of farmers and gardeners already growing together
          </p>
          <div className="mt-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/about">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
