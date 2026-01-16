# Backend URL Configuration for Reschedule/Cancel Links

## Problem
When users click "Reschedule" or "Cancel" buttons in emails, they're being redirected to the main website instead of the reschedule/cancel pages.

## Solution
The reschedule and cancel pages are hosted on the **backend server**, not the frontend. You need to configure the backend URL.

## Configuration

### Option 1: Set BACKEND_URL Environment Variable (Recommended)

Add this to your `server/.env` file:

```env
BACKEND_URL=https://lagentry-backend.vercel.app
```

Or if your backend is deployed elsewhere:
```env
BACKEND_URL=https://your-backend-url.com
```

### Option 2: If Backend is on Same Domain

If your backend and frontend are on the same domain (e.g., both on lagentry.com), you can use:

```env
BACKEND_URL=https://lagentry.com
```

But make sure your server handles the `/reschedule-demo` and `/cancel-demo` routes.

### Option 3: Vercel Automatic Detection

If deployed on Vercel, the system will automatically use:
- `VERCEL_URL` environment variable (automatically set by Vercel)
- Or `https://lagentry-backend.vercel.app` (if VERCEL environment is set)

## How to Find Your Backend URL

1. **If using Vercel:**
   - Go to your Vercel dashboard
   - Find your backend project
   - Copy the deployment URL (e.g., `https://lagentry-backend.vercel.app`)
   - Vercel automatically sets `VERCEL_URL` environment variable, so auto-detection should work

2. **If using other hosting:**
   - Check your hosting platform dashboard
   - Find the deployed backend URL
   - Use that URL

3. **If backend is on same server as frontend:**
   - Use the same domain as your frontend
   - Make sure routes are configured correctly

## Testing

After setting `BACKEND_URL`:

1. Restart your server
2. Book a demo
3. Check the email - reschedule/cancel links should point to your backend URL
4. Click the links - they should open the reschedule/cancel pages, not the main website

## Current Configuration

The system will try to use backend URL in this order:
1. `BACKEND_URL` environment variable
2. `SERVER_URL` environment variable  
3. `VERCEL_URL` (if on Vercel - automatically set by Vercel)
4. `https://lagentry-backend.vercel.app` (Vercel default if VERCEL is set)
5. Request host header (if available and not localhost)
6. `FRONTEND_URL` (fallback)
7. `https://lagentry.com` (final fallback)

## Example .env Configuration

```env
# Backend URL (for reschedule/cancel links in emails)
# For Vercel: Use your Vercel deployment URL
# Production: https://lagentry-backend.vercel.app
# Preview: https://lagentry-backend-hyfcigzmb-fahads-projects-f4464ec3.vercel.app
# Or leave empty to auto-detect from Vercel environment variables (VERCEL_URL)
BACKEND_URL=https://lagentry-backend.vercel.app

# Frontend URL (for CORS and other frontend references)
FRONTEND_URL=https://lagentry.com
```

**Note:** Vercel automatically sets `VERCEL_URL` to the current deployment URL, so preview deployments will automatically use the correct URL. The `BACKEND_URL` above is the production fallback.

**Note for Vercel:** If you don't set `BACKEND_URL`, the system will automatically use Vercel's `VERCEL_URL` environment variable. However, it's recommended to set `BACKEND_URL` explicitly for consistency.

