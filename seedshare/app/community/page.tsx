import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Flame,
  Clock,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react'
import { CreatePostDialog } from '@/components/community/create-post-dialog'
import { PostCard } from '@/components/community/post-card'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { getCommunityPosts } from './actions'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: 'hot' | 'new' | 'top' | 'rising' }>
}) {
  const params = await searchParams;
  const sortBy = params.sort || 'hot'
  const { posts, error } = await getCommunityPosts(sortBy)

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Sort tabs */}
            <Tabs value={sortBy} className="w-auto">
              <TabsList>
                <Link href="/community?sort=hot">
                  <TabsTrigger value="hot" className="gap-2">
                    <Flame className="h-4 w-4" />
                    Hot
                  </TabsTrigger>
                </Link>
                <Link href="/community?sort=new">
                  <TabsTrigger value="new" className="gap-2">
                    <Clock className="h-4 w-4" />
                    New
                  </TabsTrigger>
                </Link>
                <Link href="/community?sort=top">
                  <TabsTrigger value="top" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top
                  </TabsTrigger>
                </Link>
                <Link href="/community?sort=rising">
                  <TabsTrigger value="rising" className="gap-2">
                    <Award className="h-4 w-4" />
                    Rising
                  </TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <Link href="/communities">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Browse Communities
                </Button>
              </Link>
              <CreatePostDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Side - Posts Feed */}
          <div className="flex-1 space-y-4">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Search className="h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search communities, posts, or users..."
                    className="flex-1 outline-none bg-transparent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <p className="text-destructive">
                    <strong>Error loading posts:</strong> {error}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Make sure you've run the database setup SQL and created the community tables.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!error && posts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to create a post in the community!
                  </p>
                  <CreatePostDialog />
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  author: {
                    name: post.author?.full_name || 'Anonymous',
                    username: post.author?.email?.split('@')[0] || 'user',
                    avatar: post.author?.avatar_url || '',
                    role: post.author?.role || 'gardener',
                  },
                  community: post.community
                    ? {
                        name: post.community.name,
                        slug: post.community.id,
                        icon: '🌱',
                      }
                    : {
                        name: 'General',
                        slug: 'general',
                        icon: '🌱',
                      },
                  upvotes: post.upvotes,
                  downvotes: post.downvotes,
                  commentCount: post.comment_count,
                  createdAt: new Date(post.created_at).toLocaleString(),
                  tags: post.tags || [],
                  images: post.images || [],
                  isUpvoted: post.user_vote?.vote_type === 'up',
                  isDownvoted: post.user_vote?.vote_type === 'down',
                  isSaved: post.is_saved || false,
                }}
              />
            ))}

            {/* Load More */}
            {posts.length > 0 && (
              <div className="flex justify-center py-4">
                <Button variant="outline">Load More Posts</Button>
              </div>
            )}
          </div>

          {/* Right Side - Sidebar */}
          <CommunitySidebar />
        </div>
      </div>
    </div>
  )
}
