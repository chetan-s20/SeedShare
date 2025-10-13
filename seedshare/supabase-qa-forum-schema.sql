-- ============================================
-- Q&A Forum Schema for SeedShare
-- ============================================
-- Run this in your Supabase SQL Editor

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    accepted_answer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Votes Table
CREATE TABLE IF NOT EXISTS question_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

-- Answer Votes Table
CREATE TABLE IF NOT EXISTS answer_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(answer_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_question_votes_question ON question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer ON answer_votes(answer_id);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Questions
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON questions;
CREATE POLICY "Questions are viewable by everyone"
    ON questions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create questions" ON questions;
CREATE POLICY "Users can create questions"
    ON questions FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own questions" ON questions;
CREATE POLICY "Users can update own questions"
    ON questions FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own questions" ON questions;
CREATE POLICY "Users can delete own questions"
    ON questions FOR DELETE
    USING (auth.uid() = author_id);

-- RLS Policies for Answers
DROP POLICY IF EXISTS "Answers are viewable by everyone" ON answers;
CREATE POLICY "Answers are viewable by everyone"
    ON answers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create answers" ON answers;
CREATE POLICY "Users can create answers"
    ON answers FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own answers" ON answers;
CREATE POLICY "Users can update own answers"
    ON answers FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own answers" ON answers;
CREATE POLICY "Users can delete own answers"
    ON answers FOR DELETE
    USING (auth.uid() = author_id);

-- RLS Policies for Question Votes
DROP POLICY IF EXISTS "Users can view all question votes" ON question_votes;
CREATE POLICY "Users can view all question votes"
    ON question_votes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can vote on questions" ON question_votes;
CREATE POLICY "Users can vote on questions"
    ON question_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON question_votes;
CREATE POLICY "Users can update own votes"
    ON question_votes FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON question_votes;
CREATE POLICY "Users can delete own votes"
    ON question_votes FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Answer Votes
DROP POLICY IF EXISTS "Users can view all answer votes" ON answer_votes;
CREATE POLICY "Users can view all answer votes"
    ON answer_votes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can vote on answers" ON answer_votes;
CREATE POLICY "Users can vote on answers"
    ON answer_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own answer votes" ON answer_votes;
CREATE POLICY "Users can update own answer votes"
    ON answer_votes FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own answer votes" ON answer_votes;
CREATE POLICY "Users can delete own answer votes"
    ON answer_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update question upvotes count
CREATE OR REPLACE FUNCTION update_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE questions
    SET upvotes = (
        SELECT COUNT(*) 
        FROM question_votes 
        WHERE question_id = NEW.question_id AND vote_type = 'upvote'
    ) - (
        SELECT COUNT(*) 
        FROM question_votes 
        WHERE question_id = NEW.question_id AND vote_type = 'downvote'
    )
    WHERE id = NEW.question_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update answer upvotes count
CREATE OR REPLACE FUNCTION update_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE answers
    SET upvotes = (
        SELECT COUNT(*) 
        FROM answer_votes 
        WHERE answer_id = NEW.answer_id AND vote_type = 'upvote'
    ) - (
        SELECT COUNT(*) 
        FROM answer_votes 
        WHERE answer_id = NEW.answer_id AND vote_type = 'downvote'
    )
    WHERE id = NEW.answer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote counts
DROP TRIGGER IF EXISTS trigger_update_question_upvotes ON question_votes;
CREATE TRIGGER trigger_update_question_upvotes
    AFTER INSERT OR UPDATE OR DELETE ON question_votes
    FOR EACH ROW EXECUTE FUNCTION update_question_upvotes();

DROP TRIGGER IF EXISTS trigger_update_answer_upvotes ON answer_votes;
CREATE TRIGGER trigger_update_answer_upvotes
    AFTER INSERT OR UPDATE OR DELETE ON answer_votes
    FOR EACH ROW EXECUTE FUNCTION update_answer_upvotes();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_answers_updated_at ON answers;
CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Q&A Forum tables created successfully!';
    RAISE NOTICE '📊 Tables: questions, answers, question_votes, answer_votes';
    RAISE NOTICE '🔒 RLS policies enabled';
    RAISE NOTICE '⚡ Triggers configured for vote counts';
END $$;
