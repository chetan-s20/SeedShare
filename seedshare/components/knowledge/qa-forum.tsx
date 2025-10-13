'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, ThumbsUp, MessageCircle, Clock, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getQuestions } from '@/app/knowledge/actions'
import { formatDistanceToNow } from 'date-fns'

const categories = [
  'All Questions',
  'Seed Saving',
  'Growing Tips',
  'Pest Control',
  'Soil Management',
  'Organic Farming',
  'Irrigation',
  'Harvesting',
]

interface Question {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  upvotes: number
  views: number
  is_resolved: boolean
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  answer_count: Array<{ count: number }>
}

export function QAForum() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Questions')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent')

  useEffect(() => {
    loadQuestions()
  }, [selectedCategory, sortBy])

  const loadQuestions = async () => {
    setLoading(true)
    const { questions: data } = await getQuestions({
      category: selectedCategory,
      searchQuery: searchQuery || undefined,
      sortBy,
    })
    setQuestions(data as any)
    setLoading(false)
  }

  const handleSearch = () => {
    loadQuestions()
  }

  const mockQuestions = [
  {
    id: '1',
    title: 'Best organic fertilizer for tomatoes?',
    content: 'I want to grow organic tomatoes this season. What are the best natural fertilizers I can use?',
    author: 'Ramesh Kumar',
    category: 'Organic Farming',
    upvotes: 24,
    answers: 8,
    createdAt: '2 hours ago',
    tags: ['tomatoes', 'organic', 'fertilizer'],
  },
  {
    id: '2',
    title: 'Seed germination rate for chilli peppers',
    content: 'My chilli seeds have a low germination rate. What could be the reasons?',
    author: 'Priya Sharma',
    category: 'Seed Saving',
    upvotes: 18,
    answers: 12,
    createdAt: '5 hours ago',
    tags: ['chilli', 'germination', 'troubleshooting'],
  },
  {
    id: '3',
    title: 'Companion planting suggestions for beans',
    content: 'What crops grow well alongside beans? Looking for companion planting advice.',
    author: 'Suresh Patel',
    category: 'Growing Tips',
    upvotes: 15,
    answers: 6,
    createdAt: '1 day ago',
    tags: ['beans', 'companion-planting'],
  },
]

const categories = [
  'All Questions',
  'Seed Saving',
  'Growing Tips',
  'Pest Control',
  'Soil Management',
  'Organic Farming',
  'Irrigation',
]

  const displayQuestions = questions.length > 0 ? questions : mockQuestions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Q&A</h2>
          <p className="text-muted-foreground">
            Ask questions and get answers from experienced farmers
          </p>
        </div>
        <Link href="/knowledge/ask">
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <MessageSquare className="h-4 w-4" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
          <Button
            variant={sortBy === 'unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('unanswered')}
          >
            Unanswered
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-accent"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      )}

      {/* Questions List */}
      {!loading && (
        <div className="space-y-4">
          {displayQuestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to ask a question!</p>
                <Link href="/knowledge/ask">
                  <Button>Ask a Question</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            displayQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">{question.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <Link href={`/knowledge/question/${question.id}`}>
                      <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                        {question.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">
                      {question.content}
                    </p>
                  </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {'answers' in question ? question.answers : 0} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {'createdAt' in question 
                        ? question.createdAt 
                        : formatDistanceToNow(new Date(question.created_at), { addSuffix: true })
                      }
                    </span>
                    <span>
                      by {typeof question.author === 'string' 
                        ? question.author 
                        : question.author.full_name
                      }
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">
                      {question.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
