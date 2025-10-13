import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowUp, ArrowDown, Check, MessageSquare, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  getQuestion, 
  createAnswer, 
  voteQuestion, 
  voteAnswer, 
  acceptAnswer 
} from '../../actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getQuestion(id)

  if (result.error) {
    notFound()
  }

  // TypeScript workaround - will resolve after running SQL schema
  const question = (result as any).question
  const isAuthor = user?.id === question.author_id

  async function handleAnswerSubmit(formData: FormData) {
    'use server'
    
    const content = formData.get('content') as string
    if (!content?.trim()) return

    const questionId = formData.get('questionId') as string
    const result = await createAnswer(questionId, content)
    
    if (!result.error) {
      redirect(`/knowledge/questions/${questionId}`)
    }
  }

  async function handleVoteQuestion(formData: FormData) {
    'use server'
    
    const questionId = formData.get('questionId') as string
    const voteType = formData.get('voteType') as 'upvote' | 'downvote'
    
    await voteQuestion(questionId, voteType)
    redirect(`/knowledge/questions/${questionId}`)
  }

  async function handleVoteAnswer(formData: FormData) {
    'use server'
    
    const answerId = formData.get('answerId') as string
    const questionId = formData.get('questionId') as string
    const voteType = formData.get('voteType') as 'upvote' | 'downvote'
    
    await voteAnswer(answerId, voteType)
    redirect(`/knowledge/questions/${questionId}`)
  }

  async function handleAcceptAnswer(formData: FormData) {
    'use server'
    
    const answerId = formData.get('answerId') as string
    const questionId = formData.get('questionId') as string
    
    await acceptAnswer(questionId, answerId)
    redirect(`/knowledge/questions/${questionId}`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <Link href="/knowledge">
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Hub
        </Button>
      </Link>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-2">
              <form action={handleVoteQuestion}>
                <input type="hidden" name="questionId" value={question.id} />
                <input type="hidden" name="voteType" value="upvote" />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={!user}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </form>
              
              <span className="text-xl font-bold">{question.upvotes}</span>
              
              <form action={handleVoteQuestion}>
                <input type="hidden" name="questionId" value={question.id} />
                <input type="hidden" name="voteType" value="downvote" />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={!user}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question.answers?.length || 0} answers
                </span>
                <Badge variant="outline">{question.category}</Badge>
              </div>

              <p className="text-base whitespace-pre-wrap mb-4">{question.content}</p>

              {question.tags && question.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {question.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={question.author.avatar_url || undefined} />
                  <AvatarFallback>
                    {question.author.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{question.author.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        <div className="space-y-4">
          {question.answers?.map((answer: any) => (
            <Card key={answer.id} className={answer.is_accepted ? 'border-green-500 border-2' : ''}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-2">
                    <form action={handleVoteAnswer}>
                      <input type="hidden" name="answerId" value={answer.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="voteType" value="upvote" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={!user}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                    </form>
                    
                    <span className="text-lg font-semibold">{answer.upvotes}</span>
                    
                    <form action={handleVoteAnswer}>
                      <input type="hidden" name="answerId" value={answer.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="voteType" value="downvote" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={!user}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </form>

                    {/* Accept Answer Button (only for question author) */}
                    {isAuthor && !answer.is_accepted && (
                      <form action={handleAcceptAnswer} className="mt-2">
                        <input type="hidden" name="answerId" value={answer.id} />
                        <input type="hidden" name="questionId" value={question.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Accept this answer"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                      </form>
                    )}

                    {answer.is_accepted && (
                      <div className="mt-2 text-green-600" title="Accepted answer">
                        <Check className="h-6 w-6 fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    {answer.is_accepted && (
                      <Badge className="mb-3 bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Accepted Answer
                      </Badge>
                    )}
                    
                    <p className="text-base whitespace-pre-wrap mb-4">{answer.content}</p>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={answer.author.avatar_url || undefined} />
                        <AvatarFallback>
                          {answer.author.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{answer.author.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          answered {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      {user ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <form action={handleAnswerSubmit} className="space-y-4">
              <input type="hidden" name="questionId" value={question.id} />
              <Textarea
                name="content"
                placeholder="Write your answer here. Be clear, detailed, and helpful..."
                required
                rows={6}
                className="resize-none"
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Post Answer
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to answer this question
            </p>
            <Link href="/login">
              <Button>Login to Answer</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
