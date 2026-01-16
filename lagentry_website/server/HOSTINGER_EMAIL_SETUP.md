# Hostinger Email Configuration - Quick Setup

## ✅ Your Email Configuration

Based on your Hostinger email settings, here's what you need:

### Step 1: Create `.env` file in `server/` directory

Create a file named `.env` in the `server` folder (same folder as `index.js`) with this exact content:

```env
# Hostinger Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USER=info@lagentry.com
EMAIL_PASSWORD=A@bc23460728
EMAIL_FROM=info@lagentry.com
EMAIL_FROM_NAME=Zoya – Founder, Lagentry
COMPANY_EMAIL=info@lagentry.com
```

**Important Notes:**
- Make sure there are **NO SPACES** around the `=` sign
- The file must be named exactly `.env` (not `.env.txt`)
- The file must be in the `server/` directory

### Step 2: Restart Your Server

After creating/updating the `.env` file:

1. **Stop the server** (press Ctrl+C in the terminal)
2. **Start it again**:
   ```bash
   cd server
   npm start
   ```

### Step 3: Verify Configuration

When the server starts, you should see:

```
📧 Email Configuration Status:
  EMAIL_HOST: smtp.hostinger.com
  EMAIL_PORT: 587
  EMAIL_USE_TLS: true
  EMAIL_USER: inf***
  EMAIL_PASS: ***SET***
  EMAIL_FROM: info@lagentry.com
  COMPANY_EMAIL: info@lagentry.com
```

If you see `NOT SET` for EMAIL_USER or EMAIL_PASS, the `.env` file is not being read correctly.

## Testing

1. **Test Waitlist Email**:
   - Go to your waitlist page
   - Submit the form with a test email
   - Check the server console - you should see: `✅ Waitlist confirmation email sent: <message-id>`
   - Check the user's email inbox (and spam folder)

2. **Test Demo Booking**:
   - Book a demo through the form
   - Check server console for: `✅ Demo confirmation email sent to user: <message-id>`
   - Check server console for: `✅ Demo internal notification email sent: <message-id>`
   - Check both user email and company email (info@lagentry.com)

## Email Flow

✅ **Waitlist** → User joins → Email sent to user automatically  
✅ **Newsletter** → User subscribes → Email sent to user automatically  
✅ **Demo Booking** → User books → Email sent to user + company email automatically  
✅ **Demo Reschedule** → User reschedules → Email sent automatically  
✅ **Demo Cancel** → User cancels → Email sent automatically  

## Troubleshooting

### Issue: Still seeing "Email credentials not configured"

1. **Check file location**: `.env` must be in `server/` directory
2. **Check file name**: Must be exactly `.env` (not `env` or `.env.txt`)
3. **Check format**: No spaces around `=`
4. **Restart server**: Environment variables load only when server starts

### Issue: "Invalid login" or "Authentication failed"

- Verify the email password is correct
- Make sure there are no extra spaces in the password
- Check that `info@lagentry.com` email account exists in Hostinger

### Issue: "Connection timeout"

- Check your firewall allows SMTP (port 587)
- Verify Hostinger SMTP server is accessible
- Try using port 465 instead (change `EMAIL_PORT=465` and remove `EMAIL_USE_TLS=true`)

### Issue: Emails going to spam

- This is normal for new email setups
- Emails will improve deliverability over time
- Make sure SPF/DKIM records are set up in Hostinger DNS

## What's Configured

✅ Email service updated to support Hostinger SMTP  
✅ TLS/STARTTLS support enabled for port 587  
✅ All email templates ready (Waitlist, Newsletter, Demo, etc.)  
✅ Automatic email sending on all user actions  

Your emails will now be sent **directly from your Hostinger email** without using any third-party services like EmailJS!

