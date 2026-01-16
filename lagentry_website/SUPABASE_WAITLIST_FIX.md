# Fix for "Failed to save to database" Error

## Problem
The waitlist form is failing to save because:
1. The backend now accepts `name`, `company`, and `designation` fields
2. But your Supabase `waitlist` table might only have `email` column

## Solution

### Step 1: Update Supabase Table Structure

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Add missing columns to waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT;
```

### Step 2: Verify Table Structure

Your `waitlist` table should have these columns:
- `id` (UUID, primary key)
- `email` (TEXT, required)
- `name` (TEXT, nullable)
- `company` (TEXT, nullable)
- `designation` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, auto-generated)

### Step 3: Check RLS Policies

Make sure you have an INSERT policy:

```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'waitlist';

-- If no policy exists, create one:
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);
```

### Step 4: Restart Backend Server

After updating the table, restart your backend server:
```bash
cd server
npm start
```

### Step 5: Test Again

Try submitting the waitlist form again. It should work now.

## Alternative: If Table Doesn't Exist

If the `waitlist` table doesn't exist at all, create it:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow inserts
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);
```

