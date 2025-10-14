-- Create seed_disease_reports table
CREATE TABLE IF NOT EXISTS seed_disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Analysis Results
  disease_detected BOOLEAN NOT NULL DEFAULT false,
  severity TEXT CHECK (severity IN ('HEALTHY', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL')),
  disease_name TEXT,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  
  -- Disease Details
  symptoms TEXT[], -- Array of symptoms
  causative_agent TEXT, -- Fungal, Bacterial, Viral, Pest, None
  germination_impact TEXT,
  safe_to_plant BOOLEAN DEFAULT true,
  
  -- Treatment & Prevention
  treatment_steps TEXT[], -- Array of treatment steps
  prevention_measures TEXT[], -- Array of prevention tips
  detailed_analysis TEXT,
  recommendations TEXT,
  
  -- Buyer Warning
  buyer_warning_show BOOLEAN DEFAULT false,
  buyer_warning_message TEXT,
  buyer_warning_severity TEXT CHECK (buyer_warning_severity IN ('INFO', 'WARNING', 'DANGER')),
  
  -- Image Reference
  image_url TEXT NOT NULL,
  image_size INTEGER,
  image_type TEXT,
  
  -- Metadata
  seed_type TEXT,
  context TEXT, -- marketplace, library, community
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'disputed')),
  verified_by_expert BOOLEAN DEFAULT false,
  expert_notes TEXT
);

-- Create indexes for faster queries
CREATE INDEX idx_seed_disease_reports_seed_id ON seed_disease_reports(seed_id);
CREATE INDEX idx_seed_disease_reports_product_id ON seed_disease_reports(product_id);
CREATE INDEX idx_seed_disease_reports_reporter_id ON seed_disease_reports(reporter_id);
CREATE INDEX idx_seed_disease_reports_disease_detected ON seed_disease_reports(disease_detected);
CREATE INDEX idx_seed_disease_reports_severity ON seed_disease_reports(severity);
CREATE INDEX idx_seed_disease_reports_created_at ON seed_disease_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE seed_disease_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view disease reports (for buyer protection)
CREATE POLICY "Anyone can view disease reports"
  ON seed_disease_reports
  FOR SELECT
  USING (true);

-- Authenticated users can create disease reports
CREATE POLICY "Authenticated users can create disease reports"
  ON seed_disease_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports"
  ON seed_disease_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reporter_id)
  WITH CHECK (auth.uid() = reporter_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
  ON seed_disease_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seed_disease_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_seed_disease_reports_updated_at_trigger
  BEFORE UPDATE ON seed_disease_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_seed_disease_reports_updated_at();

-- Add disease_warning flag to seeds table (optional)
ALTER TABLE seeds ADD COLUMN IF NOT EXISTS disease_warning BOOLEAN DEFAULT false;
ALTER TABLE seeds ADD COLUMN IF NOT EXISTS disease_warning_message TEXT;
ALTER TABLE seeds ADD COLUMN IF NOT EXISTS last_quality_check TIMESTAMPTZ;

-- Add disease_warning flag to marketplace_products table (optional)
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS disease_warning BOOLEAN DEFAULT false;
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS disease_warning_message TEXT;
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS last_quality_check TIMESTAMPTZ;

-- Create view for recent disease reports with user info
CREATE OR REPLACE VIEW seed_disease_reports_with_details AS
SELECT 
  sdr.*,
  p.full_name as reporter_name,
  p.email as reporter_email,
  s.name as seed_name,
  s.variety as seed_variety,
  mp.title as product_title
FROM seed_disease_reports sdr
LEFT JOIN profiles p ON sdr.reporter_id = p.id
LEFT JOIN seeds s ON sdr.seed_id = s.id
LEFT JOIN marketplace_products mp ON sdr.product_id = mp.id
ORDER BY sdr.created_at DESC;

COMMENT ON TABLE seed_disease_reports IS 'Stores AI-powered disease analysis reports for seeds and marketplace products';
COMMENT ON COLUMN seed_disease_reports.disease_detected IS 'Whether any disease or quality issue was detected';
COMMENT ON COLUMN seed_disease_reports.severity IS 'Severity level: HEALTHY, MILD, MODERATE, SEVERE, CRITICAL';
COMMENT ON COLUMN seed_disease_reports.buyer_warning_show IS 'Whether to show warning to potential buyers';
COMMENT ON COLUMN seed_disease_reports.verified_by_expert IS 'Whether report has been verified by agricultural expert';
