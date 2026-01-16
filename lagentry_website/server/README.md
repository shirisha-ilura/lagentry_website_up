# Lagentry Backend Server

Express.js backend server for Lagentry voice call features.

## Local Development

```bash
npm install
npm start
# or
npm run dev  # with nodemon for auto-reload
```

Server runs on `http://localhost:5001`

## Environment Variables

Set these in your hosting platform (Vercel, Railway, etc.):

- `VAPI_API_KEY` - VAPI private API key
- `VAPI_PUBLIC_KEY` - VAPI public API key  
- `VAPI_BASE_URL` - VAPI API base URL (default: https://api.vapi.ai)
- `VAPI_PHONE_NUMBER_ID` - VAPI phone number ID
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `SUPABASE_URL` - Supabase project URL (default: https://zlcijmyouoasydkamyeb.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - **Recommended**: Supabase service role key (bypasses RLS, for server-side operations)
- `SUPABASE_ANON_KEY` or `SUPABASE_KEY` - Alternative: Supabase anonymous/public API key (requires RLS policies to be set up)
- `PORT` - Server port (optional, defaults to 5001)
- `FRONTEND_URL` - Frontend URL for CORS (optional)
- `NETLIFY_URL` - Netlify URL for CORS (optional)

## Supabase Setup

The backend requires several tables in Supabase. Create them with these SQL commands:

### Contacts Table

The contact form endpoint requires a `contacts` table:

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_contacts_email ON contacts(email);

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users or service role
-- Adjust this policy based on your security requirements
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  WITH CHECK (true);
```

### Waitlist Table (Updated Structure)

The waitlist endpoint requires a `waitlist` table with all fields:

```sql
-- Update existing waitlist table to include all fields
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT;

-- If table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on email
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow inserts
CREATE POLICY IF NOT EXISTS "Allow public inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);
```

### Demo Bookings Table

The book demo endpoint requires a `demo_bookings` table:

```sql
CREATE TABLE demo_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  company_size TEXT,
  message TEXT,
  booking_date TIMESTAMPTZ NOT NULL,
  booking_time TEXT NOT NULL,
  booking_datetime TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_demo_bookings_email ON demo_bookings(email);
CREATE INDEX idx_demo_bookings_date ON demo_bookings(booking_date);

-- Enable Row Level Security
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

-- Allow inserts (adjust based on your security requirements)
CREATE POLICY "Allow public inserts" ON demo_bookings
  FOR INSERT
  WITH CHECK (true);
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/contact` - Submit contact form (saves to Supabase `contacts` table)
- `POST /api/waitlist` - Join waitlist (saves to Supabase `waitlist` table)
- `POST /api/book-demo` - Book a demo (saves to Supabase `demo_bookings` table)
- `POST /api/start-voice-call` - Start a voice call with VAPI
- `POST /api/update-agent-prompt` - Update agent prompt
- `POST /api/end-conversation/:conversationId` - End a conversation

## Deployment

See `../BACKEND_DEPLOYMENT.md` for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
cd server
vercel
```

Make sure to set all environment variables in Vercel dashboard.
