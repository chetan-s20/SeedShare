'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getUserConversations, deleteConversation, type ChatConversation } from '@/lib/supabase/ai-chat'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

interface ChatSidebarProps {
  currentConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const LANGUAGE_FLAGS = {
  english: '🇬🇧',
  hindi: '🇮🇳',
  punjabi: '🇮🇳',
  haryanvi: '🇮🇳',
}

const LANGUAGE_NAMES = {
  english: 'English',
  hindi: 'हिंदी',
  punjabi: 'ਪੰਜਾਬੀ',
  haryanvi: 'हरयाणवी',
}

export function ChatSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  // Only reload sidebar when a NEW conversation is created (not on every ID change)
  // This prevents excessive reloads when switching between existing conversations
  const previousConversationId = useRef<string | null>(null)
  
  useEffect(() => {
    if (currentConversationId && currentConversationId !== previousConversationId.current) {
      // Check if this is a new conversation (not in current list)
      const isNewConversation = !conversations.find(c => c.id === currentConversationId)
      if (isNewConversation) {
        loadConversations()
      }
      previousConversationId.current = currentConversationId
    }
  }, [currentConversationId, conversations])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.title?.toLowerCase().includes(query) ||
            conv.language.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, conversations])

  const loadConversations = async () => {
    setIsLoading(true)
    const { conversations: data } = await getUserConversations()
    if (data) {
      setConversations(data)
      setFilteredConversations(data)
    }
    setIsLoading(false)
  }

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setConversationToDelete(conversationId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (conversationToDelete) {
      await deleteConversation(conversationToDelete)
      
      // If deleting current conversation, create new one
      if (conversationToDelete === currentConversationId) {
        onNewConversation()
      }
      
      // Reload conversations
      await loadConversations()
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-16 border-r bg-muted/30 flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hover:bg-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewConversation}
          className="hover:bg-accent"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Badge variant="secondary" className="writing-mode-vertical">
          {conversations.length}
        </Badge>
      </div>
    )
  }

  return (
    <>
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Chat History</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={onNewConversation}
            className="w-full gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`relative group w-full p-3 rounded-lg transition-colors hover:bg-accent cursor-pointer ${
                    currentConversationId === conversation.id
                      ? 'bg-accent border border-primary/20'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {LANGUAGE_FLAGS[conversation.language as keyof typeof LANGUAGE_FLAGS]}
                        </span>
                        <h3 className="font-medium text-sm truncate">
                          {conversation.title || 'New Chat'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(conversation.updated_at)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                          {LANGUAGE_NAMES[conversation.language as keyof typeof LANGUAGE_NAMES]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                        className="h-7 w-7 opacity-30 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Conversations</span>
            <Badge variant="secondary">{conversations.length}</Badge>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
