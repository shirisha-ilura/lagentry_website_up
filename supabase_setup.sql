-- ============================================
-- SUPABASE TABLE SETUP FOR DEMO FORM
-- ============================================
-- Copy and paste this SQL into your Supabase SQL Editor
-- Dashboard: https://app.supabase.com > SQL Editor > New Query

-- Create user_submissions table
CREATE TABLE IF NOT EXISTS user_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  demo_request_message TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  selected_date DATE,
  selected_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_submissions_email ON user_submissions(work_email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON user_submissions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for form submissions)
CREATE POLICY "Allow public insert" ON user_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can read (for admin)
CREATE POLICY "Allow authenticated read" ON user_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_submissions_updated_at
  BEFORE UPDATE ON user_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERY (run after setup)
-- ============================================
-- SELECT * FROM user_submissions ORDER BY created_at DESC LIMIT 10;


