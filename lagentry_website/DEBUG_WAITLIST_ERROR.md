# Debugging "Failed to save to database" Error

## Step 1: Check Backend Server is Running

**Make sure your backend server is running on port 5001:**

1. Open a terminal/command prompt
2. Navigate to the server folder:
   ```bash
   cd server
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. You should see:
   ```
   ✅ Supabase configured successfully
   Server running on port 5001
   ```

**If the server is NOT running, the frontend will show "Failed to save to database"**

## Step 2: Check Browser Console

After submitting the waitlist form, open your browser's Developer Console (F12) and look for:

1. **Detailed error logs** - You should now see:
   ```
   ❌ Waitlist API Error: {
     status: 500,
     result: { ... },
     error: "...",
     code: "...",
     hint: "..."
   }
   ```

2. **Network tab** - Check the `/api/waitlist` request:
   - Status code (should be 200 for success, 500 for error)
   - Response body (shows the exact error message)

## Step 3: Check Backend Server Console

Look at your backend server terminal/console. You should see one of these:

### ✅ Success:
```
📝 Attempting to insert into waitlist: { ... }
✅ Waitlist entry saved to Supabase successfully: [ ... ]
```

### ❌ Error - RLS Policy:
```
📝 Attempting to insert into waitlist: { ... }
❌ Supabase waitlist insert error: ...
Error code: 42501
Error message: new row violates row-level security policy
⚠️ RLS Policy Error: Insert operation is blocked by Row Level Security.
```

**Fix:** Use Service Role Key or create RLS policy (see WAITLIST_ERROR_FIX.md)

### ❌ Error - Connection:
```
❌ Supabase connection error: ...
Error stack: ...
```

**Fix:** Check your `.env` file has correct Supabase credentials

### ❌ Error - Table/Column:
```
❌ Supabase waitlist insert error: ...
Error code: PGRST116
Error message: relation "waitlist" does not exist
```

**Fix:** Table doesn't exist - but yours does, so this shouldn't happen

## Step 4: Verify Supabase Configuration

Check your `server/.env` file has:

```env
SUPABASE_URL=https://zlcijmyouoasydkamyeb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service_role key)
```

**OR** if using anon key:

```env
REACT_APP_SUPABASE_URL=https://zlcijmyouoasydkamyeb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)
```

## Step 5: Test Backend Directly

You can test the backend endpoint directly using curl or Postman:

```bash
curl -X POST http://localhost:5001/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","company":"Test Co","designation":"Test Role"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "data": [...]
}
```

**If you get an error, check the backend console for details.**

## Common Issues & Fixes

### Issue 1: "Backend service unavailable"
- **Cause:** Backend server not running
- **Fix:** Start backend server (`cd server && npm start`)

### Issue 2: Error code `42501` (RLS Policy)
- **Cause:** Row Level Security blocking inserts
- **Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `server/.env` OR create RLS policy

### Issue 3: "Connection timeout"
- **Cause:** Supabase URL or key incorrect
- **Fix:** Check `server/.env` has correct credentials

### Issue 4: "Table doesn't exist"
- **Cause:** Table name mismatch
- **Fix:** Verify table name is exactly `waitlist` (lowercase)

## Next Steps

1. **Check backend server is running** (Step 1)
2. **Submit waitlist form again**
3. **Check browser console** for detailed error (Step 2)
4. **Check backend console** for error details (Step 3)
5. **Share the exact error message** you see in both consoles

The error message will tell us exactly what's wrong!

