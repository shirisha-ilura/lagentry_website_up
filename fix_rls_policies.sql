-- ============================================
-- COMPLETE SETUP SCRIPT FOR USER_SUBMISSIONS
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This will create the table and set up RLS policies correctly

-- Step 1: Create the table (if it doesn't exist)
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_submissions_email ON user_submissions(work_email);
CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON user_submissions(created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public insert" ON user_submissions;
DROP POLICY IF EXISTS "Allow authenticated read" ON user_submissions;
DROP POLICY IF EXISTS "Enable insert for anon users" ON user_submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_submissions;

-- Step 5: Create INSERT policy - Allow anyone (anon) to insert
CREATE POLICY "Allow public insert" 
ON user_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 6: Create SELECT policy - Only authenticated users can read
CREATE POLICY "Allow authenticated read" 
ON user_submissions
FOR SELECT
TO authenticated
USING (true);

-- Step 7: Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_submissions_updated_at ON user_submissions;
CREATE TRIGGER update_user_submissions_updated_at
  BEFORE UPDATE ON user_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check if table exists and has RLS enabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'user_submissions';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_submissions';

-- Test insert (this should work for anon users)
-- You can test this in the SQL editor, but it should work from your form too


