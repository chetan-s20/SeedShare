import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createQuestion } from '../actions'

const categories = [
  'Crop Management',
  'Pest Control',
  'Soil Health',
  'Irrigation',
  'Seeds',
  'Equipment',
  'Market Prices',
  'Weather',
  'Other',
]

export const dynamic = 'force-dynamic'

export default async function AskQuestionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/knowledge/ask')
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const tagsInput = formData.get('tags') as string
    
    if (!title || !content || !category) {
      return
    }

    const tags = tagsInput
      ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : []

    const result = await createQuestion({
      title,
      content,
      category,
      tags,
    })

    if (result.error) {
      console.error('Error creating question:', result.error)
      return
    }

    const questionId = (result as { question: { id: string } }).question.id
    redirect(`/knowledge/questions/${questionId}`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/knowledge">
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Hub
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Get help from the community by asking your farming-related question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Question Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., How to control aphids on tomato plants?"
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Be specific and clear. This helps others understand your question quickly.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Question Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Provide detailed information about your question. Include context, what you've tried, and what you're hoping to achieve..."
                required
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The more details you provide, the better answers you'll get.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="e.g., organic, pest-control, tomatoes (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to help others find your question. Separate with commas.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Post Question
              </Button>
              <Link href="/knowledge">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tips for asking good questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>
                <strong>Be specific:</strong> Instead of "How to grow tomatoes?", ask "Why are my tomato leaves turning yellow?"
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>
                <strong>Provide context:</strong> Share your location, climate, soil type, and what you've already tried
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>
                <strong>Add photos:</strong> Visual information helps others diagnose problems better
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>
                <strong>Choose the right category:</strong> This helps your question reach the right experts
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>
                <strong>Accept helpful answers:</strong> Mark the best answer to help future readers
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
