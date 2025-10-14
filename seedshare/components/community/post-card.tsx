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
import { votePost, savePost } from '@/app/community/actions'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  content: string
  author: {
    id?: string
    name?: string
    username?: string
    avatar?: string
    avatar_url?: string
    role?: string
    full_name?: string
    email?: string
  }
  community: {
    id?: string
    name: string
    slug?: string
    icon?: string
    description?: string | null
  } | null
  upvotes: number
  downvotes: number
  commentCount: number
  comment_count?: number
  createdAt: string
  created_at?: string
  updated_at?: string
  tags: string[] | null
  images: string[] | null
  isUpvoted?: boolean
  isDownvoted?: boolean
  isSaved?: boolean
  user_vote?: {
    vote_type: 'up' | 'down'
  } | null
  is_saved?: boolean
  post_type?: string
  link_url?: string | null
  view_count?: number
  is_pinned?: boolean
  is_locked?: boolean
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
  const [isVoting, setIsVoting] = useState(false)
  const router = useRouter()

  const voteScore = upvotes - downvotes

  const handleUpvote = async () => {
    if (isVoting) return
    
    setIsVoting(true)
    
    // Optimistic update
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

    try {
      const result = await votePost(post.id, 'up')
      if (!result.success) {
        // Revert on error
        if (isUpvoted) {
          setUpvotes(upvotes)
          setIsUpvoted(true)
        } else {
          setUpvotes(upvotes)
          setIsUpvoted(false)
          if (isDownvoted) {
            setDownvotes(downvotes)
            setIsDownvoted(true)
          }
        }
        console.error('Failed to vote:', result.error)
      }
      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownvote = async () => {
    if (isVoting) return
    
    setIsVoting(true)
    
    // Optimistic update
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

    try {
      const result = await votePost(post.id, 'down')
      if (!result.success) {
        // Revert on error
        if (isDownvoted) {
          setDownvotes(downvotes)
          setIsDownvoted(true)
        } else {
          setDownvotes(downvotes)
          setIsDownvoted(false)
          if (isUpvoted) {
            setUpvotes(upvotes)
            setIsUpvoted(true)
          }
        }
        console.error('Failed to vote:', result.error)
      }
      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSave = async () => {
    // Optimistic update
    setIsSaved(!isSaved)
    
    try {
      const result = await savePost(post.id)
      if (!result.success) {
        // Revert on error
        setIsSaved(isSaved)
        console.error('Failed to save post:', result.error)
      }
      router.refresh()
    } catch (error) {
      console.error('Error saving post:', error)
      setIsSaved(isSaved)
    }
  }

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`)
  }

  // Get display data with fallbacks
  const displayCreatedAt = post.createdAt || post.created_at || '';
  const displayCommentCount = post.commentCount || post.comment_count || 0;
  const displayUserVote = post.user_vote?.vote_type || (post.isUpvoted ? 'up' : post.isDownvoted ? 'down' : null);
  const isSavedPost = isSaved || post.is_saved || false;
  const displayTags = post.tags || [];
  const displayImages = post.images || [];
  
  // Username handling - different APIs return different structures
  const username = post.author?.username || post.author?.email?.split('@')[0] || '';
  const authorName = post.author?.name || post.author?.full_name || username || '';
  const authorRole = post.author?.role || 'Member';
  const avatarUrl = post.author?.avatar || post.author?.avatar_url || '';
  
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
              {post.community && (
                <>
                  <Link
                    href={`/community/${post.community.slug || post.community.name || post.community.id}`}
                    className="flex items-center gap-1 font-semibold hover:underline"
                  >
                    <span>{post.community.icon || '🌱'}</span>
                    <span>c/{post.community.slug || post.community.name || post.community.id}</span>
                  </Link>
                  <span>•</span>
                </>
              )}
              <span>Posted by</span>
              <Link href={`/profile/${username}`} className="hover:underline">
                u/{username}
              </Link>
              <Badge variant="outline" className="text-xs">
                {authorRole}
              </Badge>
              <span>•</span>
              <span>{displayCreatedAt}</span>
            </div>

            {/* Post Title */}
            <Link href={`/community/post/${post.id}`}>
              <h2 className="text-xl font-bold mb-2 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
            </Link>

            {/* Post Tags */}
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {displayTags.map((tag) => (
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
            {displayImages.length > 0 && (
              <div className={`grid gap-2 mb-3 ${
                displayImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-64 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
                  >
                    {image.startsWith('data:') ? (
                      // For inline base64 images
                      <img 
                        src={image} 
                        alt={`Post image ${index + 1}`} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    ) : image.startsWith('http') ? (
                      // For normal URLs (including Supabase storage URLs)
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback for failed image loads
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('image-error');
                        }}
                      />
                    ) : (
                      // Fallback for missing/invalid image URLs
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <ExternalLink className="h-12 w-12" />
                        <span className="ml-2">Image unavailable</span>
                      </div>
                    )}
                    
                    {/* Add error fallback display */}
                    <div className="hidden image-error absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <ExternalLink className="h-12 w-12" />
                      <span className="ml-2">Image failed to load</span>
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
              <span>{displayCommentCount} Comments</span>
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
                isSavedPost ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSavedPost ? 'fill-current' : ''}`} />
              <span>{isSavedPost ? 'Saved' : 'Save'}</span>
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
