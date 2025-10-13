'use server'

import { createClient } from '@/lib/supabase/server'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatConversation {
  id: string
  user_id: string | null
  title: string | null
  language: string
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

/**
 * Create a new chat conversation
 */
export async function createChatConversation(language: string = 'english') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('ai_chat_conversations')
    .insert({
      user_id: user?.id || null,
      language,
      title: 'New Chat',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return { conversation: null, error }
  }

  return { conversation: data as ChatConversation, error: null }
}

/**
 * Get all conversations for current user
 */
export async function getUserConversations() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // For anonymous users, return conversations without user_id
    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .select('*')
      .is('user_id', null)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return { conversations: [], error }
    }

    return { conversations: data as ChatConversation[], error: null }
  }

  const { data, error } = await supabase
    .from('ai_chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return { conversations: [], error }
  }

  return { conversations: data as ChatConversation[], error: null }
}

/**
 * Get a specific conversation with all messages
 */
export async function getConversation(conversationId: string) {
  const supabase = await createClient()
  
  const { data: conversation, error: convError } = await supabase
    .from('ai_chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (convError) {
    console.error('Error fetching conversation:', convError)
    return { conversation: null, error: convError }
  }

  const { data: messages, error: msgError } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (msgError) {
    console.error('Error fetching messages:', msgError)
    return { conversation: null, error: msgError }
  }

  return {
    conversation: {
      ...conversation,
      messages: messages as ChatMessage[],
    } as ChatConversation,
    error: null,
  }
}

/**
 * Save a message to a conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return { message: null, error }
  }

  // Update conversation title if it's the first user message
  if (role === 'user') {
    const { data: messages } = await supabase
      .from('ai_chat_messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('role', 'user')

    if (messages && messages.length === 1) {
      // This is the first user message, use it as title
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      await supabase
        .from('ai_chat_conversations')
        .update({ title })
        .eq('id', conversationId)
    }
  }

  return { message: data as ChatMessage, error: null }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('ai_chat_conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Update conversation language
 */
export async function updateConversationLanguage(
  conversationId: string,
  language: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('ai_chat_conversations')
    .update({ language })
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation language:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('ai_chat_conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation title:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}
