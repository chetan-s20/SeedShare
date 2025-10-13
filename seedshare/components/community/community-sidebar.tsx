'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  MessageSquare,
  Star,
} from 'lucide-react'
import { CreateCommunityDialog } from './create-community-dialog'

const quickLinks = [
  { icon: BookOpen, label: 'Seed Library', href: '/library' },
  { icon: MessageSquare, label: 'Knowledge Hub', href: '/knowledge' },
  { icon: Users, label: 'Browse Communities', href: '/communities' },
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
          <CreateCommunityDialog />
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
