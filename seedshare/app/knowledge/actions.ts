'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Get all questions with filters
export async function getQuestions(options?: {
  category?: string
  searchQuery?: string
  sortBy?: 'recent' | 'popular' | 'unanswered'
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('questions')
    .select(`
      *,
      author:profiles!questions_author_id_fkey(id, full_name, avatar_url),
      answer_count:answers(count)
    `)

  // Filter by category
  if (options?.category && options.category !== 'All Questions') {
    query = query.eq('category', options.category)
  }

  // Search filter
  if (options?.searchQuery) {
    query = query.or(`title.ilike.%${options.searchQuery}%,content.ilike.%${options.searchQuery}%`)
  }

  // Sorting
  if (options?.sortBy === 'popular') {
    query = query.order('upvotes', { ascending: false })
  } else if (options?.sortBy === 'unanswered') {
    query = query.eq('is_resolved', false)
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Limit
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching questions:', error)
    return { questions: [], error: error.message }
  }

  return { questions: data || [], error: null }
}

// Get single question with answers
export async function getQuestion(questionId: string) {
  const supabase = await createClient()

  // Increment view count
  await supabase.rpc('increment', { row_id: questionId, table_name: 'questions', column_name: 'views' })

  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      author:profiles!questions_author_id_fkey(id, full_name, avatar_url, city, state),
      answers(
        *,
        author:profiles!answers_author_id_fkey(id, full_name, avatar_url)
      )
    `)
    .eq('id', questionId)
    .single()

  if (error) {
    console.error('Error fetching question:', error)
    return { question: null, error: error.message }
  }

  return { question: data, error: null }
}

// Create a new question
export async function createQuestion(formData: {
  title: string
  content: string
  category: string
  tags: string[]
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { question: null, error: 'You must be logged in to ask a question' }
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating question:', error)
    return { question: null, error: error.message }
  }

  revalidatePath('/knowledge')
  return { question: data, error: null }
}

// Create an answer
export async function createAnswer(questionId: string, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { answer: null, error: 'You must be logged in to answer' }
  }

  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: questionId,
      content,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating answer:', error)
    return { answer: null, error: error.message }
  }

  revalidatePath(`/knowledge/questions/${questionId}`)
  return { answer: data, error: null }
}

// Vote on a question
export async function voteQuestion(questionId: string, voteType: 'upvote' | 'downvote') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to vote' }
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('question_votes')
    .select('*')
    .eq('question_id', questionId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // If same vote type, remove vote (toggle)
    if (existingVote.vote_type === voteType) {
      const { error } = await supabase
        .from('question_votes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      // Update to new vote type
      const { error } = await supabase
        .from('question_votes')
        .update({ vote_type: voteType })
        .eq('question_id', questionId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }
  } else {
    // Create new vote
    const { error } = await supabase
      .from('question_votes')
      .insert({
        question_id: questionId,
        user_id: user.id,
        vote_type: voteType,
      })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/knowledge')
  return { success: true, error: null }
}

// Vote on an answer
export async function voteAnswer(answerId: string, voteType: 'upvote' | 'downvote') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to vote' }
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('answer_votes')
    .select('*')
    .eq('answer_id', answerId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // If same vote type, remove vote (toggle)
    if (existingVote.vote_type === voteType) {
      const { error } = await supabase
        .from('answer_votes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      // Update to new vote type
      const { error } = await supabase
        .from('answer_votes')
        .update({ vote_type: voteType })
        .eq('answer_id', answerId)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }
  } else {
    // Create new vote
    const { error } = await supabase
      .from('answer_votes')
      .insert({
        answer_id: answerId,
        user_id: user.id,
        vote_type: voteType,
      })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/knowledge')
  return { success: true, error: null }
}

// Mark answer as accepted
export async function acceptAnswer(questionId: string, answerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  // Verify user is the question author
  const { data: question } = await supabase
    .from('questions')
    .select('author_id')
    .eq('id', questionId)
    .single()

  if (!question || question.author_id !== user.id) {
    return { success: false, error: 'Only the question author can accept answers' }
  }

  // Update question
  const { error: questionError } = await supabase
    .from('questions')
    .update({
      accepted_answer_id: answerId,
      is_resolved: true,
    })
    .eq('id', questionId)

  if (questionError) {
    return { success: false, error: questionError.message }
  }

  // Mark answer as accepted
  const { error: answerError } = await supabase
    .from('answers')
    .update({ is_accepted: true })
    .eq('id', answerId)

  if (answerError) {
    return { success: false, error: answerError.message }
  }

  revalidatePath(`/knowledge/questions/${questionId}`)
  return { success: true, error: null }
}

// Delete question
export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('author_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/knowledge')
  return { success: true, error: null }
}

// Delete answer
export async function deleteAnswer(answerId: string, questionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', answerId)
    .eq('author_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/knowledge/questions/${questionId}`)
  return { success: true, error: null }
}
