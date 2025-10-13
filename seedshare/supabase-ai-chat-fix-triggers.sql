-- =====================================================
-- FIX: Update AI Chat Trigger Functions
-- Run this in Supabase SQL Editor if you get trigger errors
-- =====================================================

-- Drop old function if exists
DROP FUNCTION IF EXISTS update_ai_chat_updated_at();

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

-- Function to auto-update updated_at on conversation update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_conversation_timestamp ON ai_chat_messages;
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON ai_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

DROP TRIGGER IF EXISTS update_ai_chat_conversations_updated_at ON ai_chat_conversations;
CREATE TRIGGER update_ai_chat_conversations_updated_at
    BEFORE UPDATE ON ai_chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify triggers exist
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
AND event_object_table IN ('ai_chat_conversations', 'ai_chat_messages')
ORDER BY event_object_table, trigger_name;
