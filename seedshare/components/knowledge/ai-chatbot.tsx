'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createChatConversation, saveMessage, getConversation } from '@/lib/supabase/ai-chat'
import { ChatSidebar } from './chat-sidebar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
  english: "Hi! I'm your SeedShare AI assistant, powered by Gemini 2.5. I can help you with seed selection, planting techniques, pest control, soil management, and more. What would you like to know?",
  hindi: "नमस्ते! मैं आपका SeedShare AI सहायक हूं, Gemini 2.5 द्वारा संचालित। मैं बीज चयन, रोपण तकनीक, कीट नियंत्रण, मिट्टी प्रबंधन आदि में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?",
  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ SeedShare AI ਸਹਾਇਕ ਹਾਂ, Gemini 2.5 ਦੁਆਰਾ ਸੰਚਾਲਿਤ। ਮੈਂ ਬੀਜ ਚੋਣ, ਬੀਜਾਈ ਤਕਨੀਕ, ਕੀੜੇ ਨਿਯੰਤਰਣ, ਮਿੱਟੀ ਪ੍ਰਬੰਧਨ ਆਦਿ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੋਗੇ?",
  haryanvi: "राम राम! मैं थारा SeedShare AI सहायक सूं, Gemini 2.5 तै चाल्लूं सूं। मैं बीज चुनण, बुवाई, कीड़े मारण, माट्टी सम्भालण म्ह थारी मदद कर सकूं सूं। थम के जाणणा चाओगे?"
}

export function AIChatbot() {
  const [language, setLanguage] = useState<string>('english')
  const [conversationId, setConversationId] = useState<string | null>(null)
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

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      const { conversation } = await createChatConversation(language)
      if (conversation) {
        setConversationId(conversation.id)
      }
    }
    initConversation()
  }, [])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async () => {
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
      // Save user message to database
      if (conversationId) {
        await saveMessage(conversationId, 'user', userContent)
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
        throw new Error('Failed to get response')
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

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant response to database
      if (conversationId) {
        await saveMessage(conversationId, 'assistant', data.response.trim())
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
    if (conversation && conversation.messages) {
      setConversationId(id)
      setLanguage(conversation.language)
      
      // Convert saved messages to UI format
      const loadedMessages = conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
      }))
      
      setMessages(loadedMessages)
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
                AI Assistant
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Gemini 2.5
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
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
              <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {message.content}
              </div>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500">
                <Bot className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 px-4 py-3 rounded-lg bg-muted mr-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="flex gap-2 w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about seeds, farming, or gardening..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
    </div>
  )
}
