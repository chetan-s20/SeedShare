'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Mock articles data
const mockArticles = [
  {
    id: '1',
    title: 'Complete Guide to Seed Saving for Beginners',
    excerpt: 'Learn the fundamentals of saving seeds from your garden. This comprehensive guide covers selection, harvesting, processing, and storage techniques.',
    author: 'Dr. Priya Sharma',
    category: 'Seed Saving',
    readTime: '10 min read',
    publishedDate: 'Jan 15, 2025',
    image: '/articles/seed-saving.jpg',
    tags: ['beginner', 'seed-saving', 'tutorial'],
  },
  {
    id: '2',
    title: 'Organic Pest Control Methods for Indian Gardens',
    excerpt: 'Discover effective organic pest control techniques suitable for Indian climate and crops. Say goodbye to harmful chemicals!',
    author: 'Ramesh Kumar',
    category: 'Pest Control',
    readTime: '8 min read',
    publishedDate: 'Jan 12, 2025',
    image: '/articles/pest-control.jpg',
    tags: ['organic', 'pest-control', 'sustainable'],
  },
  {
    id: '3',
    title: 'Understanding Soil pH for Better Yields',
    excerpt: 'Soil pH affects nutrient availability and plant growth. Learn how to test and adjust your soil pH for optimal results.',
    author: 'Dr. Suresh Patel',
    category: 'Soil Management',
    readTime: '6 min read',
    publishedDate: 'Jan 10, 2025',
    image: '/articles/soil-ph.jpg',
    tags: ['soil', 'ph', 'nutrients'],
  },
  {
    id: '4',
    title: 'Companion Planting Chart for Indian Vegetables',
    excerpt: 'Maximize your garden space and yields with strategic companion planting. Includes detailed charts for common Indian vegetables.',
    author: 'Anita Desai',
    category: 'Growing Tips',
    readTime: '12 min read',
    publishedDate: 'Jan 8, 2025',
    image: '/articles/companion-planting.jpg',
    tags: ['companion-planting', 'vegetables', 'chart'],
  },
]

const categories = [
  'All Articles',
  'Seed Saving',
  'Growing Tips',
  'Pest Control',
  'Soil Management',
  'Irrigation',
  'Organic Farming',
]

export function ArticlesSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expert Articles & Guides</h2>
          <p className="text-muted-foreground">
            In-depth guides written by agricultural experts
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Browse All
        </Button>
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

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {mockArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Article Image */}
            <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>

            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{article.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {article.readTime}
                </span>
              </div>
              
              <Link href={`/knowledge/article/${article.id}`}>
                <h3 className="text-xl font-bold hover:text-blue-600 cursor-pointer line-clamp-2">
                  {article.title}
                </h3>
              </Link>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {article.excerpt}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {article.publishedDate}
                  </span>
                </div>
              </div>

              {/* Read More Button */}
              <Link href={`/knowledge/article/${article.id}`}>
                <Button variant="ghost" className="w-full gap-2">
                  Read Article
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline">Load More Articles</Button>
      </div>
    </div>
  )
}
