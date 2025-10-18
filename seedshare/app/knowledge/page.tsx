import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, MessageSquare, BookOpen, Search, TrendingUp } from 'lucide-react'
import { AIChatbot } from '@/components/knowledge/ai-chatbot'
import { QAForum } from '@/components/knowledge/qa-forum'
import { ArticlesSection } from '@/components/knowledge/articles-section'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Knowledge Hub | SeedShare',
  description: 'Get expert advice, ask questions, and learn about seeds and farming',
}

export default function KnowledgeHubPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Knowledge Hub</h1>
            <p className="text-lg text-indigo-100">
              Your one-stop destination for seed wisdom. Ask our AI assistant, browse community Q&A, 
              or explore expert articles.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chatbot" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="chatbot" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Q&A Forum
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Articles
            </TabsTrigger>
          </TabsList>

          {/* AI Chatbot Tab */}
          <TabsContent value="chatbot" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <AIChatbot />
              </div>
              
              <div className="space-y-4">
                {/* Quick Tips Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• Be specific about your crop and location</p>
                    <p>• Mention soil type and climate</p>
                    <p>• Ask about germination, storage, or growing</p>
                    <p>• Request step-by-step guides</p>
                  </CardContent>
                </Card>

                {/* Popular Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Popular Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                      🌱 Seed Germination Tips
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                      🌾 Organic Pest Control
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                      💧 Irrigation Best Practices
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                      🌿 Soil Health Management
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Q&A Forum Tab */}
          <TabsContent value="qa">
            <QAForum />
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <ArticlesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
