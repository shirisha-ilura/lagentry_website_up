# Troubleshooting: Cannot GET /api/verify-composio

If you're getting "Cannot GET /api/verify-composio", follow these steps:

## Step 1: Restart Your Express Server

The endpoint was just added to the server, so you need to restart it:

### Option A: If using `npm run dev` (both React + Express)
1. Stop the current process (Ctrl+C)
2. Restart:
   ```bash
   npm run dev
   ```

### Option B: If running servers separately
1. **Stop the Express server** (Ctrl+C in the terminal running it)
2. **Restart the Express server:**
   ```bash
   npm run server:dev
   ```
   Or from the server directory:
   ```bash
   cd server
   npm run dev
   ```

### Option C: Using the PowerShell script
```powershell
.\start-backend.ps1
```

## Step 2: Verify Server is Running

Check that the server started successfully. You should see:
```
Server running on port 5001
```

## Step 3: Test the Endpoint

### Test directly on Express server:
```bash
curl http://localhost:5001/api/verify-composio
```

Or visit in browser:
```
http://localhost:5001/api/verify-composio
```

### Test via React app (proxied):
```bash
curl http://localhost:3000/api/verify-composio
```

Or visit in browser:
```
http://localhost:3000/api/verify-composio
```

## Step 4: Check for Errors

If you still get errors, check:

1. **Is the server actually running?**
   - Check terminal for "Server running on port 5001"
   - Try accessing `http://localhost:5001/health` - should return `{"status":"ok"}`

2. **Are there any syntax errors?**
   - Check the terminal where the server is running for error messages
   - Look for any red error text

3. **Is port 5001 already in use?**
   - Windows: `netstat -ano | findstr :5001`
   - If something else is using it, either stop that process or change the PORT in `.env`

## Step 5: Verify the Endpoint Exists

The endpoint should be in `lagentry_website/server/index.js` around line 872. You can verify with:
```bash
# Windows PowerShell
Select-String -Path "lagentry_website/server/index.js" -Pattern "verify-composio"
```

## Common Issues

### Issue: "Cannot GET /api/verify-composio"
**Solution:** Server needs restart after code changes

### Issue: "ECONNREFUSED" or connection refused
**Solution:** Express server is not running. Start it with `npm run server:dev`

### Issue: Port 5001 already in use
**Solution:** 
- Find what's using it: `netstat -ano | findstr :5001`
- Kill the process or change PORT in `.env` file

### Issue: Server starts but endpoint still not found
**Solution:** 
- Make sure you saved the file
- Check that the endpoint code is actually in `server/index.js`
- Look for any syntax errors preventing the route from being registered

## Quick Test Commands

```bash
# Test if server is running
curl http://localhost:5001/health

# Test the verify endpoint
curl http://localhost:5001/api/verify-composio

# Test another endpoint to verify routing works
curl http://localhost:5001/api/test-cors
```

If `/health` and `/api/test-cors` work but `/api/verify-composio` doesn't, there might be a syntax error in the endpoint code.
