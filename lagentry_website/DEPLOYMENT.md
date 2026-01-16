# Deployment Guide

## Backend Deployment

The voice call feature requires a backend server to be deployed and accessible. The backend is located in the `backend/` folder.

### Option 1: Deploy Backend to a Cloud Service

You can deploy the backend to services like:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)
- **Fly.io** (free tier available)

### Steps to Deploy Backend:

1. **Prepare the backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Set environment variables** in your hosting service:
   - `VAPI_API_KEY` - Your VAPI API key
   - `VAPI_PUBLIC_KEY` - Your VAPI public key
   - `VAPI_BASE_URL` - VAPI base URL (usually `https://api.vapi.ai`)
   - `SUPABASE_URL` - Your Supabase URL
   - `SUPABASE_KEY` - Your Supabase key
   - `PORT` - Port number (usually 5001 or let the service assign one)

3. **Deploy the backend** to your chosen service

4. **Get the backend URL** (e.g., `https://your-backend.herokuapp.com`)

### Option 2: Configure Frontend (Netlify)

After deploying the backend, you need to set the backend URL in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add a new environment variable:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** Your deployed backend URL (e.g., `https://your-backend.herokuapp.com`)
   - **Important:** Do NOT include a trailing slash
4. **Redeploy** your site for the changes to take effect

**Note:** Without this environment variable, the voice call feature will show an error: "Backend service is not configured. Please contact support."

### Important Notes:

- The backend URL should **NOT** include a trailing slash
- The backend URL should be the full URL (e.g., `https://your-backend.herokuapp.com`)
- Make sure CORS is configured in your backend to allow requests from your Netlify domain
- The backend must be running and accessible for the voice call feature to work

### Testing:

1. In development: The frontend will use the proxy configured in `package.json` (localhost:5001)
2. In production: The frontend will use the `REACT_APP_BACKEND_URL` environment variable

### Troubleshooting:

If you see "Failed to fetch" errors:
1. Verify the backend is deployed and running
2. Check that `REACT_APP_BACKEND_URL` is set correctly in Netlify
3. Verify CORS is configured in the backend to allow your Netlify domain
4. Check the backend logs for any errors
5. Ensure all environment variables are set in the backend deployment

