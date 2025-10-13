-- =====================================================
-- AI CHATBOT DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Chat Conversations Table (stores conversation sessions)
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT, -- Auto-generated from first message
    language TEXT DEFAULT 'english' CHECK (language IN ('english', 'hindi', 'punjabi', 'haryanvi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table (stores individual messages)
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user 
    ON ai_chat_conversations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation 
    ON ai_chat_messages(conversation_id, created_at ASC);

-- Enable Row Level Security
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_chat_conversations;
CREATE POLICY "Users can view their own conversations" 
    ON ai_chat_conversations FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create their own conversations" ON ai_chat_conversations;
CREATE POLICY "Users can create their own conversations" 
    ON ai_chat_conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_chat_conversations;
CREATE POLICY "Users can update their own conversations" 
    ON ai_chat_conversations FOR UPDATE 
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_chat_conversations;
CREATE POLICY "Users can delete their own conversations" 
    ON ai_chat_conversations FOR DELETE 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON ai_chat_messages;
CREATE POLICY "Users can view messages from their conversations" 
    ON ai_chat_messages FOR SELECT 
    USING (
        conversation_id IN (
            SELECT id FROM ai_chat_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON ai_chat_messages;
CREATE POLICY "Users can create messages in their conversations" 
    ON ai_chat_messages FOR INSERT 
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM ai_chat_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON ai_chat_messages;
CREATE POLICY "Users can delete messages from their conversations" 
    ON ai_chat_messages FOR DELETE 
    USING (
        conversation_id IN (
            SELECT id FROM ai_chat_conversations 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Function to update conversation timestamp when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_chat_conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation updated_at on new message
DROP TRIGGER IF EXISTS update_conversation_timestamp ON ai_chat_messages;
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON ai_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Function to auto-update updated_at on conversation update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation updated_at on conversation update
DROP TRIGGER IF EXISTS update_ai_chat_conversations_updated_at ON ai_chat_conversations;
CREATE TRIGGER update_ai_chat_conversations_updated_at
    BEFORE UPDATE ON ai_chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES (optional - for testing)
-- =====================================================

-- View all conversations
-- SELECT * FROM ai_chat_conversations ORDER BY updated_at DESC;

-- View messages for a specific conversation
-- SELECT * FROM ai_chat_messages WHERE conversation_id = 'YOUR_CONVERSATION_ID' ORDER BY created_at ASC;

-- Count messages per conversation
-- SELECT c.id, c.title, COUNT(m.id) as message_count
-- FROM ai_chat_conversations c
-- LEFT JOIN ai_chat_messages m ON m.conversation_id = c.id
-- GROUP BY c.id, c.title
-- ORDER BY c.updated_at DESC;
