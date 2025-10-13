'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  TrendingUp,
  Plus,
  Crown,
  Flame,
  Award,
  BookOpen,
  MessageSquare,
  Calendar,
  Star,
} from 'lucide-react'

const topCommunities = [
  {
    name: 'Seed Saving Tips',
    slug: 'seed-saving-tips',
    icon: '🌱',
    members: 15420,
    online: 892,
    trending: true,
  },
  {
    name: 'Urban Farming',
    slug: 'urban-farming',
    icon: '🏙️',
    members: 12340,
    online: 567,
    trending: true,
  },
  {
    name: 'Organic Gardening',
    slug: 'organic-gardening',
    icon: '🌿',
    members: 9876,
    online: 445,
    trending: false,
  },
  {
    name: 'Indigenous Seeds',
    slug: 'indigenous-seeds',
    icon: '🌾',
    members: 7654,
    online: 234,
    trending: true,
  },
  {
    name: 'Seed Science',
    slug: 'seed-science',
    icon: '🔬',
    members: 5432,
    online: 178,
    trending: false,
  },
]

const quickLinks = [
  { icon: BookOpen, label: 'Seed Library', href: '/library' },
  { icon: MessageSquare, label: 'Q&A Forum', href: '/knowledge' },
  { icon: Users, label: 'Expert Connect', href: '/experts' },
  { icon: Calendar, label: 'Events', href: '/events' },
]

const trendingTopics = [
  { tag: 'heirloom-tomatoes', posts: 234 },
  { tag: 'germination-tips', posts: 189 },
  { tag: 'seed-exchange', posts: 156 },
  { tag: 'organic-certification', posts: 134 },
  { tag: 'urban-gardening', posts: 112 },
]

export function CommunitySidebar() {
  return (
    <div className="w-80 space-y-4 sticky top-20">
      {/* Create Community Card */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            Community Hub
          </CardTitle>
          <CardDescription>
            Connect with fellow seed enthusiasts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Join communities, share knowledge, and grow together!
          </p>
          <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
            <Plus className="h-4 w-4" />
            Create Community
          </Button>
        </CardContent>
      </Card>

      {/* Top Communities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCommunities.map((community, index) => (
            <Link
              key={community.slug}
              href={`/community/${community.slug}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -m-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full text-xl">
                  {community.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm truncate">
                      {index + 1}. c/{community.slug}
                    </span>
                    {community.trending && (
                      <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{(community.members / 1000).toFixed(1)}k members</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                      {community.online} online
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <Separator />
          <Button variant="link" className="w-full text-blue-600 dark:text-blue-400" asChild>
            <Link href="/community/discover">View All Communities →</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <Link
              key={topic.tag}
              href={`/community/tag/${topic.tag}`}
              className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -m-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5">
                  {index + 1}
                </span>
                <Badge variant="secondary" className="text-xs">
                  #{topic.tag}
                </Badge>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{topic.posts} posts</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300"
            >
              <link.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>{link.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* User Stats Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">42</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">234</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Comments</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1.2k</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Karma</div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">5</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Awards</div>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link href="/profile">View Profile</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card>
        <CardContent className="p-4 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Link href="/help" className="hover:underline">Help</Link>
            <span>•</span>
            <Link href="/guidelines" className="hover:underline">Guidelines</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            SeedShare Community © 2025
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
