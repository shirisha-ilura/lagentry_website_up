# Composio API Key Verification Guide

This guide explains how to check if your Composio API key is connected and working properly.

## Quick Verification Methods

### Method 1: Use the Verification Endpoint (Recommended)

A verification endpoint has been created at `/api/verify-composio` that checks:
- If the `COMPOSIO_API_KEY` environment variable is set
- If the key is valid by making a test API call to Composio

**To use it:**

1. **If running locally:**
   ```bash
   # Make sure both the React app and Express server are running
   # Option 1: Run both together
   npm run dev
   
   # Option 2: Run separately
   # Terminal 1:
   npm start
   # Terminal 2:
   npm run server:dev
   
   # Then visit in your browser or use curl:
   curl http://localhost:3000/api/verify-composio
   # Or directly on the Express server:
   curl http://localhost:5001/api/verify-composio
   ```

2. **If deployed on Vercel:**
   ```bash
   # Visit in your browser:
   https://your-domain.com/api/verify-composio
   
   # Or use curl:
   curl https://your-domain.com/api/verify-composio
   ```

**Note:** The endpoint is available in both:
- Express server (for local development): `http://localhost:5001/api/verify-composio`
- Vercel serverless function (for production): `/api/verify-composio`

**Expected Response (Success):**
```json
{
  "success": true,
  "connected": true,
  "message": "Composio API key is valid and connected successfully!",
  "details": {
    "keyExists": true,
    "keyLength": 50,
    "keyPrefix": "your-key-prefix...",
    "apiEndpoint": "https://api.composio.dev/v1/apps",
    "testResponse": {
      "status": 200,
      "statusText": "OK",
      "hasData": true
    }
  }
}
```

**Expected Response (Not Configured):**
```json
{
  "success": false,
  "connected": false,
  "error": "COMPOSIO_API_KEY is not configured",
  "message": "The Composio API key is not set in your environment variables."
}
```

### Method 2: Check Environment Variables

#### For Local Development:

1. Check if you have a `.env` file in your project root or in the `api/` directory
2. Look for `COMPOSIO_API_KEY` in the file:
   ```env
   COMPOSIO_API_KEY=your-api-key-here
   ```

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Check if `COMPOSIO_API_KEY` is listed
4. Verify it has a value (it will show as masked)

#### For Other Platforms:

Check your hosting platform's environment variable configuration:
- **Netlify**: Site settings → Environment variables
- **Railway**: Project → Variables
- **Heroku**: Settings → Config Vars

### Method 3: Test the Integrations Search Endpoint

The integrations search endpoint (`/api/integrations-search`) will fail if the Composio key is not configured:

1. Visit: `http://localhost:3000/api/integrations-search` (or your deployed URL)
2. If the key is missing, you'll get an error:
   ```json
   {
     "success": false,
     "error": "COMPOSIO_API_KEY is not configured on the server"
   }
   ```
3. If the key is configured but invalid, you'll get a Composio API error

### Method 4: Check Server Logs

When the server starts or when the integrations endpoint is called, check the console/logs:

- **Missing key**: You'll see errors like "COMPOSIO_API_KEY is not configured"
- **Invalid key**: You'll see "Composio API error" with status codes (401, 403, etc.)

## Setting Up the Composio API Key

If the key is not configured, follow these steps:

### 1. Get Your Composio API Key

1. Sign up or log in to [Composio](https://www.composio.dev/)
2. Go to your dashboard/account settings
3. Navigate to API Keys section
4. Create a new API key or copy an existing one

### 2. Add the Key to Your Environment

#### Local Development (.env file):

Create or edit `.env` in your project root:
```env
COMPOSIO_API_KEY=your-composio-api-key-here
```

**Note**: Make sure `.env` is in your `.gitignore` file to avoid committing secrets!

#### Vercel:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `COMPOSIO_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development (select as needed)
4. Click **Save**
5. **Important**: Redeploy your application for changes to take effect

#### Other Platforms:

Add `COMPOSIO_API_KEY` as an environment variable in your hosting platform's settings.

## Troubleshooting

### Issue: "COMPOSIO_API_KEY is not configured"

**Solution:**
- Make sure the environment variable is set in your hosting platform
- For local development, ensure `.env` file exists and contains the key
- Restart your development server after adding the key
- For deployed apps, redeploy after adding environment variables

### Issue: "Composio API error (401)" or "Composio API error (403)"

**Solution:**
- Your API key might be invalid or expired
- Generate a new API key from Composio dashboard
- Make sure you're using the correct key (not a test key if you need production access)

### Issue: "Failed to connect to Composio API"

**Solution:**
- Check your internet connection
- Verify the Composio API endpoint is accessible: `https://api.composio.dev/v1/apps`
- Check if there are any firewall or network restrictions

## Code Location

The Composio integration is implemented in:
- **API Endpoint**: `lagentry_website/api/integrations-search.js`
- **Verification Endpoint**: `lagentry_website/api/verify-composio.js`
- **Frontend**: `lagentry_website/src/pages/Connections.tsx`

The key is read from `process.env.COMPOSIO_API_KEY` in the serverless function.

## Additional Notes

- The API key is **never exposed** to the client-side code
- All Composio API calls are made server-side for security
- The verification endpoint is safe to call from the browser (it doesn't expose the actual key)
