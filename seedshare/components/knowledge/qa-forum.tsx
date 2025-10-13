'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ThumbsUp, MessageCircle, Clock } from 'lucide-react'
import Link from 'next/link'

// Mock Q&A data - will be replaced with real database queries
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

export function QAForum() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Q&A</h2>
          <p className="text-muted-foreground">
            Ask questions and get answers from experienced farmers
          </p>
        </div>
        <Link href="/knowledge/ask">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="cursor-pointer hover:bg-accent"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {mockQuestions.map((question) => (
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
                      <MessageCircle className="h-4 w-4" />
                      {question.answers} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {question.createdAt}
                    </span>
                    <span>by {question.author}</span>
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
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline">Load More Questions</Button>
      </div>
    </div>
  )
}
