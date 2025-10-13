'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
    username: string
    avatar: string
    role: string
  }
  community: {
    name: string
    slug: string
    icon: string
  }
  upvotes: number
  downvotes: number
  commentCount: number
  createdAt: string
  tags: string[]
  images: string[]
  isUpvoted: boolean
  isDownvoted: boolean
  isSaved: boolean
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes)
  const [downvotes, setDownvotes] = useState(post.downvotes)
  const [isUpvoted, setIsUpvoted] = useState(post.isUpvoted)
  const [isDownvoted, setIsDownvoted] = useState(post.isDownvoted)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [showFullContent, setShowFullContent] = useState(false)

  const voteScore = upvotes - downvotes

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(upvotes - 1)
      setIsUpvoted(false)
    } else {
      setUpvotes(upvotes + 1)
      setIsUpvoted(true)
      if (isDownvoted) {
        setDownvotes(downvotes - 1)
        setIsDownvoted(false)
      }
    }
  }

  const handleDownvote = () => {
    if (isDownvoted) {
      setDownvotes(downvotes - 1)
      setIsDownvoted(false)
    } else {
      setDownvotes(downvotes + 1)
      setIsDownvoted(true)
      if (isUpvoted) {
        setUpvotes(upvotes - 1)
        setIsUpvoted(false)
      }
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`)
  }

  return (
    <Card className="hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-800 p-2 rounded-l-lg">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/30 ${
              isUpvoted ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={handleUpvote}
          >
            <ArrowBigUp className={`h-6 w-6 ${isUpvoted ? 'fill-current' : ''}`} />
          </Button>
          <span className={`text-sm font-bold ${
            voteScore > 0 ? 'text-orange-500 dark:text-orange-400' : voteScore < 0 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {voteScore > 999 ? `${(voteScore / 1000).toFixed(1)}k` : voteScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 ${
              isDownvoted ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={handleDownvote}
          >
            <ArrowBigDown className={`h-6 w-6 ${isDownvoted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <CardContent className="p-4">
            {/* Post Header */}
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
              <Link
                href={`/community/${post.community.slug}`}
                className="flex items-center gap-1 font-semibold hover:underline"
              >
                <span>{post.community.icon}</span>
                <span>c/{post.community.slug}</span>
              </Link>
              <span>•</span>
              <span>Posted by</span>
              <Link href={`/profile/${post.author.username}`} className="hover:underline">
                u/{post.author.username}
              </Link>
              <Badge variant="outline" className="text-xs">
                {post.author.role}
              </Badge>
              <span>•</span>
              <span>{post.createdAt}</span>
            </div>

            {/* Post Title */}
            <Link href={`/community/post/${post.id}`}>
              <h2 className="text-xl font-bold mb-2 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
            </Link>

            {/* Post Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Post Content */}
            <div className="text-gray-700 mb-3">
              <p className={showFullContent ? '' : 'line-clamp-3'}>
                {post.content}
              </p>
              {post.content.length > 200 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-blue-600 text-sm hover:underline mt-1"
                >
                  {showFullContent ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Post Images */}
            {post.images.length > 0 && (
              <div className={`grid gap-2 mb-3 ${
                post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-64 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <ExternalLink className="h-12 w-12" />
                      <span className="ml-2">Image placeholder</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Post Footer */}
          <CardFooter className="px-4 py-2 border-t dark:border-gray-700 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} Comments</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isSaved ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Report</DropdownMenuItem>
                  <DropdownMenuItem>Hide</DropdownMenuItem>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
