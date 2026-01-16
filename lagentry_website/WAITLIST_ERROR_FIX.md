# Fix for "Failed to save to database" - Waitlist Error

## The Problem
Your Supabase table structure is correct (has all columns: `id`, `email`, `name`, `company`, `designation`, `created_at`), but inserts are being blocked.

## Most Likely Cause: RLS (Row Level Security)

Your `waitlist` table has RLS enabled, but there's no INSERT policy allowing inserts.

## Solution Options

### Option 1: Use Service Role Key (Recommended - Bypasses RLS)

1. **Get your Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the `anon` key)

2. **Update your `server/.env` file:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service_role key)
   ```

3. **Restart your backend server:**
   ```bash
   cd server
   npm start
   ```

### Option 2: Create RLS Policy (If using anon key)

1. **Go to Supabase Dashboard:**
   - Table Editor → `waitlist` table
   - Click "RLS policy" button in the toolbar

2. **Create a new policy:**
   - Click "New Policy"
   - Policy name: `Allow public inserts`
   - Allowed operation: `INSERT`
   - Policy definition:
     ```sql
     WITH CHECK (true)
     ```
   - Click "Save"

3. **Verify the policy:**
   - You should see the policy listed under RLS policies

## Check Your Backend Server Logs

When you submit the waitlist form, check your backend server console. You should see one of these:

- ✅ `✅ Waitlist entry saved to Supabase successfully:` - Success!
- ❌ `❌ Supabase waitlist insert error:` - Check the error code:
  - `42501` = RLS policy blocking (use Option 1 or 2 above)
  - `PGRST116` = Table doesn't exist (but yours does, so not this)
  - Other = Check the error message

## Quick Test

After applying the fix:

1. **Restart backend server** (if you changed `.env`)
2. **Try submitting the waitlist form again**
3. **Check Supabase table** - you should see a new row with all fields populated

## If Still Not Working

Check your backend server console for the exact error message and share it. The error will tell us exactly what's wrong:
- RLS policy issue
- Connection timeout
- Invalid credentials
- etc.

