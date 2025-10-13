import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Award,
  Plus,
  Search,
  Filter,
  Users,
  Flame,
} from 'lucide-react'
import { CreatePostDialog } from '@/components/community/create-post-dialog'
import { PostCard } from '@/components/community/post-card'
import { CommunitySidebar } from '@/components/community/community-sidebar'

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    title: 'Just harvested my first heirloom tomatoes! Tips for seed saving?',
    content: 'My San Marzano tomatoes are finally ready! I want to save seeds for next year. Should I ferment them or can I just dry them out? Any advice from experienced seed savers?',
    author: {
      name: 'Sarah Johnson',
      username: 'seedsaver_sarah',
      avatar: '/avatars/user1.jpg',
      role: 'Gardener',
    },
    community: {
      name: 'Seed Saving Tips',
      slug: 'seed-saving-tips',
      icon: '🌱',
    },
    upvotes: 234,
    downvotes: 12,
    commentCount: 45,
    createdAt: '2h ago',
    tags: ['tomatoes', 'heirloom', 'seed-saving'],
    images: ['/posts/tomatoes1.jpg', '/posts/tomatoes2.jpg'],
    isUpvoted: false,
    isDownvoted: false,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Urban gardening success story - 50kg harvest from my balcony!',
    content: 'Started with just 5 square feet on my apartment balcony 6 months ago. Today I harvested my 50th kg of vegetables this season! Container gardening really works. Happy to share my setup and seed varieties.',
    author: {
      name: 'Raj Kumar',
      username: 'urbanfarmer_raj',
      avatar: '/avatars/user2.jpg',
      role: 'Farmer',
    },
    community: {
      name: 'Urban Farming',
      slug: 'urban-farming',
      icon: '🏙️',
    },
    upvotes: 1567,
    downvotes: 34,
    commentCount: 189,
    createdAt: '5h ago',
    tags: ['success-story', 'urban-farming', 'balcony'],
    images: ['/posts/balcony1.jpg'],
    isUpvoted: true,
    isDownvoted: false,
    isSaved: true,
  },
  {
    id: '3',
    title: 'PSA: Beware of fake organic seed sellers on marketplace',
    content: 'Found several sellers claiming "100% organic certified" but when I asked for certification numbers, they couldn\'t provide. Always verify certificates before buying. Stay safe!',
    author: {
      name: 'Dr. Priya Sharma',
      username: 'expert_priya',
      avatar: '/avatars/user3.jpg',
      role: 'Expert',
    },
    community: {
      name: 'Seed Market Watch',
      slug: 'seed-market-watch',
      icon: '🔍',
    },
    upvotes: 892,
    downvotes: 45,
    commentCount: 156,
    createdAt: '8h ago',
    tags: ['psa', 'marketplace', 'organic'],
    images: [],
    isUpvoted: false,
    isDownvoted: false,
    isSaved: false,
  },
  {
    id: '4',
    title: 'My germination rate experiment - 12 varieties tested!',
    content: 'Spent the last 3 weeks testing germination rates of seeds from different sources. Created a detailed spreadsheet with results. Some surprising findings! Full data in comments.',
    author: {
      name: 'Mike Chen',
      username: 'data_gardener',
      avatar: '/avatars/user4.jpg',
      role: 'Gardener',
    },
    community: {
      name: 'Seed Science',
      slug: 'seed-science',
      icon: '🔬',
    },
    upvotes: 445,
    downvotes: 8,
    commentCount: 67,
    createdAt: '1d ago',
    tags: ['experiment', 'data', 'germination'],
    images: ['/posts/chart1.jpg', '/posts/chart2.jpg'],
    isUpvoted: false,
    isDownvoted: false,
    isSaved: true,
  },
  {
    id: '5',
    title: 'Looking for rare indigenous seed varieties in Maharashtra region',
    content: 'I\'m working on a conservation project to preserve indigenous seed varieties. If anyone has or knows about traditional seeds from Maharashtra (especially millets and pulses), please reach out!',
    author: {
      name: 'Amit Patil',
      username: 'seed_conservator',
      avatar: '/avatars/user5.jpg',
      role: 'Farmer',
    },
    community: {
      name: 'Indigenous Seeds',
      slug: 'indigenous-seeds',
      icon: '🌾',
    },
    upvotes: 678,
    downvotes: 15,
    commentCount: 92,
    createdAt: '1d ago',
    tags: ['conservation', 'indigenous', 'maharashtra'],
    images: [],
    isUpvoted: true,
    isDownvoted: false,
    isSaved: false,
  },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Sort tabs */}
            <Tabs defaultValue="hot" className="w-auto">
              <TabsList>
                <TabsTrigger value="hot" className="gap-2">
                  <Flame className="h-4 w-4" />
                  Hot
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-2">
                  <Clock className="h-4 w-4" />
                  New
                </TabsTrigger>
                <TabsTrigger value="top" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top
                </TabsTrigger>
                <TabsTrigger value="rising" className="gap-2">
                  <Award className="h-4 w-4" />
                  Rising
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
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

            {/* Posts Feed */}
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load More */}
            <div className="flex justify-center py-4">
              <Button variant="outline">Load More Posts</Button>
            </div>
          </div>

          {/* Right Side - Sidebar */}
          <CommunitySidebar />
        </div>
      </div>
    </div>
  )
}
