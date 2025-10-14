import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AnalysisHistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses, error } = await supabase
    .from('seed_image_analysis')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', className: string }> = {
      healthy: { variant: 'default', className: 'bg-green-600' },
      diseased: { variant: 'destructive', className: 'bg-red-600' },
      damaged: { variant: 'secondary', className: 'bg-orange-600' },
      infested: { variant: 'destructive', className: 'bg-red-700' },
      moldy: { variant: 'destructive', className: 'bg-purple-600' },
      unknown: { variant: 'outline', className: '' },
    }
    return variants[condition] || variants.unknown
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/knowledge" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
          <h1 className="text-4xl font-bold mb-2">Seed Analysis History</h1>
          <p className="text-xl text-indigo-100">
            View all your previous seed health analyses
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Error loading analyses: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {!analyses || analyses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="max-w-md mx-auto">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No analyses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start analyzing seed images using the AI chatbot to see them here
                </p>
                <Button asChild>
                  <Link href="/knowledge">Go to AI Chatbot</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} found
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis: any) => {
                const badgeInfo = getConditionBadge(analysis.seed_condition)
                return (
                  <Card key={analysis.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={analysis.image_url}
                          alt="Analyzed seed"
                          fill
                          className="object-cover"
                        />
                        <Badge className={`absolute top-3 right-3 ${badgeInfo.className}`}>
                          {analysis.seed_condition}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Confidence</span>
                          <span className="text-sm text-muted-foreground">
                            {(analysis.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>

                        {analysis.diseases_detected && analysis.diseases_detected.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Diseases Detected:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.diseases_detected.slice(0, 3).map((disease: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {disease}
                                </Badge>
                              ))}
                              {analysis.diseases_detected.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{analysis.diseases_detected.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-1">Recommendations:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {analysis.recommendations.slice(0, 2).map((rec: string, i: number) => (
                                <li key={i} className="line-clamp-1">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
