-- Seed Image Analysis Table
-- Run this in Supabase SQL Editor

-- Create table for storing seed image analysis results
CREATE TABLE IF NOT EXISTS seed_image_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  analysis_result JSONB,
  seed_condition TEXT CHECK (seed_condition IN ('healthy', 'diseased', 'damaged', 'infested', 'moldy', 'unknown')),
  confidence_score DECIMAL(5,4),
  diseases_detected TEXT[],
  recommendations TEXT[],
  medicines_suggested JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE seed_image_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analyses"
  ON seed_image_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON seed_image_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON seed_image_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seed_analysis_user ON seed_image_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_analysis_created ON seed_image_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seed_analysis_condition ON seed_image_analysis(seed_condition);

-- Success message
SELECT 'Seed image analysis table created successfully!' as message;
