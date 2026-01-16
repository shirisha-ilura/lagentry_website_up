# How to Change Sender Email to info@lagentry.com

## The Problem
Currently, emails are being sent from `nshirisha1712@gmail.com`, but you want them sent from `info@lagentry.com`.

## Solution: Update EmailJS Service Configuration

The sender email address is configured in your **EmailJS service settings**, not in the code. Here's how to change it:

## Step 1: Access EmailJS Dashboard

1. Go to https://www.emailjs.com/
2. Log in to your account
3. Navigate to **Email Services** (in the left sidebar)

## Step 2: Update Your Email Service

### Option A: Reconnect with info@lagentry.com (Recommended)

1. Find your email service (likely `service_xj5lxrm`)
2. Click on it to open the service settings
3. Click **"Reconnect"** or **"Edit"** button
4. You'll be prompted to authorize with Gmail
5. **Important:** Use the Gmail account: **info@lagentry.com**
   - If you don't have access to this Gmail account, you'll need to:
     - Sign in to Gmail with `info@lagentry.com`
     - Authorize EmailJS to send emails from this account
6. Complete the authorization process
7. Save the service

### Option B: Set From Email in Templates

If you can't change the service email, you can set it in each template:

1. Go to **Email Templates** in EmailJS
2. For each template (waitlist, demo booking, etc.):
   - Click to edit the template
   - Find the **"From Email"** field
   - Change it to: `info@lagentry.com`
   - Set **"From Name"** to: `Zoya – Founder, Lagentry`
   - Save the template

## Step 3: Verify the Change

1. Test by submitting the waitlist form
2. Check the email you receive
3. The "From" address should show: `info@lagentry.com` (or `Zoya – Founder, Lagentry <info@lagentry.com>`)

## Important Notes

- **Gmail Account Required:** You must have access to the `info@lagentry.com` Gmail account to authorize EmailJS
- **If you don't have access:** You'll need to:
  1. Get access to `info@lagentry.com` Gmail account
  2. Or create a new Gmail account for `info@lagentry.com`
  3. Or use a different email service provider in EmailJS (like SendGrid, Mailgun, etc.)

## Alternative: Use a Different Email Service

If you can't use Gmail with `info@lagentry.com`, you can:

1. Set up a different email service in EmailJS (SendGrid, Mailgun, etc.)
2. Configure it to send from `info@lagentry.com`
3. Update your service ID in the `.env` file

## After Making Changes

1. **Restart your React app** (if needed)
2. **Test the waitlist form** to verify emails are sent from `info@lagentry.com`
3. **Check the "From" field** in received emails

---

**Note:** The code doesn't need to be changed - this is purely an EmailJS configuration change.

