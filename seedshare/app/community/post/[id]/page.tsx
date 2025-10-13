'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Award,
  Reply,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Mock post data
const post = {
  id: '1',
  title: 'Just harvested my first heirloom tomatoes! Tips for seed saving?',
  content: `My San Marzano tomatoes are finally ready! I want to save seeds for next year. 

I've heard different methods - some people say you should ferment the seeds, others say just dry them out. I'm a bit confused about which method is better and why.

Also, how do I know when the tomatoes are at the perfect ripeness for seed saving? Should I wait until they're overripe?

Any advice from experienced seed savers would be greatly appreciated! I'm hoping to build a collection of heirloom varieties over the years.`,
  author: {
    name: 'Sarah Johnson',
    username: 'seedsaver_sarah',
    avatar: '/avatars/user1.jpg',
    role: 'Gardener',
    karma: 1234,
  },
  community: {
    name: 'Seed Saving Tips',
    slug: 'seed-saving-tips',
    icon: '🌱',
    members: 15420,
  },
  upvotes: 234,
  commentCount: 45,
  createdAt: '2 hours ago',
  tags: ['tomatoes', 'heirloom', 'seed-saving'],
  awards: [
    { name: 'Helpful', count: 2 },
    { name: 'Silver', count: 1 },
  ],
}

const comments = [
  {
    id: '1',
    author: {
      name: 'Dr. Priya Sharma',
      username: 'expert_priya',
      role: 'Expert',
      avatar: '/avatars/user3.jpg',
    },
    content: 'Fermentation is definitely the way to go for tomatoes! It mimics the natural process and helps remove the gel coating around seeds. Here\'s how I do it:\n\n1. Scoop seeds into a jar with some tomato juice\n2. Let it ferment for 2-3 days (you\'ll see mold on top)\n3. Add water and the good seeds sink\n4. Rinse and dry on a paper plate\n\nThe fermentation also helps kill seed-borne diseases.',
    upvotes: 156,
    createdAt: '1 hour ago',
    replies: 8,
    isExpanded: true,
    children: [
      {
        id: '1-1',
        author: {
          name: 'Sarah Johnson',
          username: 'seedsaver_sarah',
          role: 'Gardener',
          avatar: '/avatars/user1.jpg',
        },
        content: 'Thank you so much! How long should I dry them after rinsing?',
        upvotes: 23,
        createdAt: '45 min ago',
        replies: 0,
        children: [],
      },
      {
        id: '1-2',
        author: {
          name: 'Dr. Priya Sharma',
          username: 'expert_priya',
          role: 'Expert',
          avatar: '/avatars/user3.jpg',
        },
        content: 'Usually 1-2 weeks in a well-ventilated area. They should snap when you bend them, not bend.',
        upvotes: 34,
        createdAt: '30 min ago',
        replies: 0,
        children: [],
      },
    ],
  },
  {
    id: '2',
    author: {
      name: 'Mike Chen',
      username: 'data_gardener',
      role: 'Gardener',
      avatar: '/avatars/user4.jpg',
    },
    content: 'I\'ve tested both methods with germination rate experiments. Fermented seeds consistently showed 85-90% germination vs 70-75% for just-dried seeds. The difference is statistically significant!',
    upvotes: 89,
    createdAt: '50 min ago',
    replies: 3,
    isExpanded: false,
    children: [],
  },
]

function CommentThread({ comment, depth = 0 }: { comment: any; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(comment.isExpanded ?? true)
  const [showReply, setShowReply] = useState(false)
  const [upvoted, setUpvoted] = useState(false)

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-2 py-3">
        {/* Vote section */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${upvoted ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => setUpvoted(!upvoted)}
          >
            <ArrowBigUp className={`h-4 w-4 ${upvoted ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-xs font-semibold text-gray-600">{comment.upvotes}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400"
          >
            <ArrowBigDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${comment.author.username}`} className="font-semibold text-sm hover:underline">
              {comment.author.username}
            </Link>
            <Badge variant="outline" className="text-xs">
              {comment.author.role}
            </Badge>
            <span className="text-xs text-gray-500">• {comment.createdAt}</span>
          </div>

          <div className="text-sm text-gray-700 whitespace-pre-line mb-2">
            {comment.content}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2"
              onClick={() => setShowReply(!showReply)}
            >
              <Reply className="h-3 w-3" />
              Reply
            </Button>
            <Button variant="ghost" size="sm" className="h-6 gap-1 px-2">
              <Award className="h-3 w-3" />
              Award
            </Button>
            <Button variant="ghost" size="sm" className="h-6 gap-1 px-2">
              <Share2 className="h-3 w-3" />
              Share
            </Button>
            {comment.replies > 0 && (
              <button
                className="flex items-center gap-1 hover:underline"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply textarea */}
          {showReply && (
            <div className="mt-3 space-y-2">
              <Textarea placeholder="Write a reply..." rows={3} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm">Comment</Button>
                <Button size="sm" variant="outline" onClick={() => setShowReply(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {isExpanded && comment.children && comment.children.length > 0 && (
            <div className="mt-2">
              {comment.children.map((child: any) => (
                <CommentThread key={child.id} comment={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [saved, setSaved] = useState(false)
  const voteScore = post.upvotes + (upvoted ? 1 : 0) - (downvoted ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link href="/community" className="hover:underline">Community</Link>
          {' → '}
          <Link href={`/community/${post.community.slug}`} className="hover:underline">
            c/{post.community.slug}
          </Link>
          {' → '}
          <span className="text-gray-900">Post</span>
        </div>

        {/* Main Post Card */}
        <Card className="mb-6">
          <div className="flex">
            {/* Vote section */}
            <div className="flex flex-col items-center gap-2 bg-gray-50 p-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${upvoted ? 'text-orange-500' : 'text-gray-500'}`}
                onClick={() => {
                  setUpvoted(!upvoted)
                  if (downvoted) setDownvoted(false)
                }}
              >
                <ArrowBigUp className={`h-6 w-6 ${upvoted ? 'fill-current' : ''}`} />
              </Button>
              <span className={`text-lg font-bold ${
                voteScore > 0 ? 'text-orange-500' : 'text-gray-700'
              }`}>
                {voteScore}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${downvoted ? 'text-blue-500' : 'text-gray-500'}`}
                onClick={() => {
                  setDownvoted(!downvoted)
                  if (upvoted) setUpvoted(false)
                }}
              >
                <ArrowBigDown className={`h-6 w-6 ${downvoted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Link href={`/community/${post.community.slug}`} className="flex items-center gap-1 hover:underline">
                    <span className="text-lg">{post.community.icon}</span>
                    <span className="font-semibold">c/{post.community.slug}</span>
                  </Link>
                  <span>•</span>
                  <span>{post.community.members.toLocaleString()} members</span>
                </div>

                <h1 className="text-2xl font-bold mb-3">{post.title}</h1>

                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline">
                      u/{post.author.username}
                    </Link>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Badge variant="outline" className="text-xs">{post.author.role}</Badge>
                      <span>•</span>
                      <span>{post.author.karma} karma</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-gray-700 whitespace-pre-line mb-4">
                  {post.content}
                </div>

                {post.awards.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    {post.awards.map((award, i) => (
                      <div key={i} className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold">{award.name}</span>
                        <span className="text-xs text-gray-600">x{award.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {post.commentCount} Comments
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${saved ? 'text-yellow-600' : ''}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 ml-auto">
                  <Award className="h-4 w-4" />
                  Give Award
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>

        {/* Add Comment */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="What are your thoughts?"
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">Comment</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{post.commentCount} Comments</h2>
              <select className="text-sm border rounded px-3 py-1">
                <option>Best</option>
                <option>Top</option>
                <option>New</option>
                <option>Controversial</option>
                <option>Old</option>
              </select>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            {comments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
