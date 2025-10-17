'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles, RotateCcw, ImageIcon, X, Camera } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createChatConversation, saveMessage, getConversation } from '@/lib/supabase/ai-chat'
import { ChatSidebar } from './chat-sidebar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  isAnalysis?: boolean
}

const EXAMPLE_QUESTIONS = [
  "How do I store tomato seeds for next season?",
  "What's the best time to plant wheat in North India?",
  "How can I improve soil fertility organically?",
  "My seeds aren't germinating. What could be wrong?",
]

const LANGUAGES = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'haryanvi', name: 'हरयाणवी', flag: '🇮🇳' },
]

const WELCOME_MESSAGES = {
  english: "Hi! I'm your SeedSearch AI assistant. I can help you with seed selection, planting techniques, pest control, soil management, and more. What would you like to know?",
  hindi: "नमस्ते! मैं आपका SeedSearch AI सहायक हूं। मैं बीज चयन, रोपण तकनीक, कीट नियंत्रण, मिट्टी प्रबंधन आदि में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?",
  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ SeedSearch AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਬੀਜ ਚੋਣ, ਬੀਜਾਈ ਤਕਨੀਕ, ਕੀੜੇ ਨਿਯੰਤਰਣ, ਮਿੱਟੀ ਪ੍ਰਬੰਧਨ ਆਦਿ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੋਗੇ?",
  haryanvi: "राम राम! मैं थारा SeedSearch AI सहायक सूं। मैं बीज चुनण, बुवाई, कीड़े मारण, माट्टी सम्भालण म्ह थारी मदद कर सकूं सूं। थम के जाणणा चाओगे?"
}

export function AIChatbot() {
  const [language, setLanguage] = useState<string>('english')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES],
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Initialize by loading most recent conversation (don't create new one)
  useEffect(() => {
    const loadRecentConversation = async () => {
      const { getUserConversations } = await import('@/lib/supabase/ai-chat')
      const { conversations } = await getUserConversations()
      
      if (conversations && conversations.length > 0) {
        // Load most recent conversation
        const recent = conversations[0]
        await handleLoadConversation(recent.id)
      }
      // If no conversations exist, user can click "New Chat" button
    }
    loadRecentConversation()
  }, [])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    
    // Add user message with image
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'Please analyze this seed image for health issues',
      imageUrl: imagePreview || undefined,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('context', input)

      const response = await fetch('/api/analyze-seed', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Analysis API error:', error)
        const errorMessage = error.details 
          ? `${error.error}: ${error.details}`
          : error.error || 'Failed to analyze image'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const analysis = data.analysis
      
      // Create formatted response message
      const responseContent = `## 🔬 Seed Health Analysis Results

**Condition:** ${analysis.seedCondition.toUpperCase()} ${analysis.severity !== 'none' ? `(${analysis.severity})` : ''}
**Confidence:** ${(analysis.confidenceScore * 100).toFixed(1)}%

${analysis.diseasesDetected?.length > 0 ? `### 🦠 Diseases Detected
${analysis.diseasesDetected.map((d: string) => `- ${d}`).join('\n')}
` : ''}${analysis.symptoms?.length > 0 ? `### 📋 Symptoms Observed
${analysis.symptoms.map((s: string) => `- ${s}`).join('\n')}
` : ''}${analysis.possibleCauses?.length > 0 ? `### 🔍 Possible Causes
${analysis.possibleCauses.map((c: string) => `- ${c}`).join('\n')}
` : ''}${analysis.medicinesSuggested?.length > 0 ? `### 💊 Recommended Medicines

${analysis.medicinesSuggested.map((med: any) => `**${med.name}** (${med.type})
- **Dosage:** ${med.dosage}
- **Application:** ${med.applicationMethod}
- **Precautions:** ${med.precautions}
`).join('\n')}` : ''}${analysis.recommendations?.length > 0 ? `### ✅ Recommendations
${analysis.recommendations.map((r: string) => `- ${r}`).join('\n')}
` : ''}${analysis.preventiveMeasures?.length > 0 ? `### 🛡️ Preventive Measures
${analysis.preventiveMeasures.map((p: string) => `- ${p}`).join('\n')}
` : ''}${analysis.storageAdvice ? `### 📦 Storage Advice
${analysis.storageAdvice}
` : ''}${analysis.viabilityAssessment ? `### 🌱 Viability Assessment
${analysis.viabilityAssessment}
` : ''}
---

${analysis.detailedAnalysis}`

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        imageUrl: data.imageUrl,
        isAnalysis: true,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Clear image selection
      clearImage()

    } catch (error: any) {
      console.error('Image analysis error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error analyzing the seed image: ${error.message}. Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
      }])
    } finally {
      setIsAnalyzing(false)
      scrollToBottom()
    }
  }

  const handleSendMessage = async () => {
    // If image is selected, analyze it instead
    if (selectedImage) {
      await handleAnalyzeImage()
      return
    }

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userContent = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // Create conversation if it doesn't exist (first message)
      let currentConvId = conversationId
      if (!currentConvId) {
        const { conversation } = await createChatConversation(language)
        if (conversation) {
          currentConvId = conversation.id
          setConversationId(currentConvId)
        }
      }

      // Save user message to database
      if (currentConvId) {
        await saveMessage(currentConvId, 'user', userContent)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userContent,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          language: language,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Chat API error:', errorData)
        const errorMessage = errorData.error || errorData.details || `Server error: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Check if response has error
      if (data.error) {
        throw new Error(data.error)
      }

      // Ensure we have a valid response
      if (!data.response || data.response.trim().length === 0) {
        throw new Error('Empty response from AI')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response.trim(),
        timestamp: new Date(),
      }

      // Add search indicator if web search was used
      if (data.searchUsed) {
        assistantMessage.content = `🌐 ${assistantMessage.content}`
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant response to database
      if (currentConvId) {
        await saveMessage(currentConvId, 'assistant', data.response.trim())
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.message || 'Please try again or contact support if the issue persists.'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES],
        timestamp: new Date(),
      },
    ])
  }

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage)
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: WELCOME_MESSAGES[newLanguage as keyof typeof WELCOME_MESSAGES],
        timestamp: new Date(),
      },
    ])
    
    // Create new conversation with new language
    const { conversation } = await createChatConversation(newLanguage)
    if (conversation) {
      setConversationId(conversation.id)
    }
  }

  const handleNewConversation = async () => {
    const { conversation } = await createChatConversation(language)
    if (conversation) {
      setConversationId(conversation.id)
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES],
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleLoadConversation = async (id: string) => {
    const { conversation } = await getConversation(id)
    if (conversation) {
      setConversationId(id)
      setLanguage(conversation.language)
      
      if (conversation.messages && conversation.messages.length > 0) {
        // Convert saved messages to UI format
        const loadedMessages = conversation.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
        
        setMessages(loadedMessages)
      } else {
        // No messages yet, show welcome message
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: WELCOME_MESSAGES[conversation.language as keyof typeof WELCOME_MESSAGES],
            timestamp: new Date(),
          },
        ])
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[750px] border rounded-lg overflow-hidden">
      <ChatSidebar
        currentConversationId={conversationId}
        onSelectConversation={handleLoadConversation}
        onNewConversation={handleNewConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <Card className="flex-1 flex flex-col border-0 rounded-none">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                SeedSearch AI
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Powered
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Smart Agricultural Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Example Questions */}
        {messages.length === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Try asking:</p>
            <div className="grid gap-2">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(question)}
                  className="text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className={message.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-indigo-500 to-purple-500'}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-12'
                  : 'bg-muted mr-12'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border">
                  <Image
                    src={message.imageUrl}
                    alt="Seed image"
                    width={300}
                    height={200}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              {message.role === 'user' ? (
                <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {message.content}
                </div>
              ) : (
                <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                      code: ({ className, children }) => {
                        const isInline = !className
                        return isInline ? (
                          <code className="bg-muted-foreground/20 px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-muted-foreground/20 p-3 rounded-md text-xs font-mono overflow-x-auto my-2">
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <p 
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                }`}
                suppressHydrationWarning
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {(isLoading || isAnalyzing) && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500">
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 px-4 py-3 rounded-lg bg-muted mr-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {isAnalyzing ? 'Analyzing seed image...' : 'Thinking...'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="w-full space-y-3">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Selected seed"
                width={150}
                height={150}
                className="rounded-lg border-2 border-indigo-300"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={clearImage}
              >
                <X className="h-3 w-3" />
              </Button>
              <Badge className="absolute bottom-2 left-2 bg-indigo-600">
                <Camera className="h-3 w-3 mr-1" />
                Ready to analyze
              </Badge>
            </div>
          )}

          <div className="flex gap-2 w-full">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Camera button */}
            <Button
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isAnalyzing}
              title="Upload seed image for health analysis"
              className="shrink-0"
            >
              <Camera className="h-5 w-5" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedImage ? "Add context for the image (optional)..." : "Ask anything about seeds, or upload a seed image for health analysis..."}
              className="min-h-[60px] resize-none"
              disabled={isLoading || isAnalyzing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!input.trim() && !selectedImage) || isLoading || isAnalyzing}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shrink-0"
            >
              {isLoading || isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : selectedImage ? (
                <span className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  Analyze
                </span>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
    </div>
  )
}
