# Email Configuration Instructions

## Problem
You're seeing this error:
```
⚠️ Email credentials not configured. Emails will not be sent.
Please set EMAIL_USER and EMAIL_PASSWORD environment variables.
```

## Solution

### Step 1: Create/Edit `.env` file in `server/` directory

Create a file named `.env` in the `server` folder with the following content:

```env
# Email Configuration (REQUIRED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@lagentry.com
EMAIL_PASSWORD=your-gmail-app-password-here
EMAIL_FROM=info@lagentry.com
EMAIL_FROM_NAME=Zoya – Founder, Lagentry
COMPANY_EMAIL=info@lagentry.com
```

### Step 2: Get Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the setup process
3. **Generate App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Lagentry Server" as the name
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
4. **Add to .env file**:
   - Remove spaces from the password
   - Add it to `EMAIL_PASSWORD` in your `.env` file

### Step 3: Restart Server

After updating the `.env` file, restart your server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd server
npm start
```

### Step 4: Verify Configuration

When you start the server, you should see:
```
📧 Email Configuration Status:
  EMAIL_HOST: smtp.gmail.com
  EMAIL_PORT: 587
  EMAIL_USER: inf***
  EMAIL_PASS: ***SET***
  EMAIL_FROM: info@lagentry.com
  COMPANY_EMAIL: info@lagentry.com
```

If you see `NOT SET` for EMAIL_USER or EMAIL_PASS, the `.env` file is not being read correctly.

## Alternative: Use Different Email Provider

### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## Troubleshooting

### Issue: Still seeing "Email credentials not configured"

1. **Check file location**: Make sure `.env` is in the `server/` directory (same folder as `index.js`)
2. **Check file name**: It must be exactly `.env` (not `.env.txt` or `env`)
3. **Check format**: No spaces around `=` sign
   - ✅ Correct: `EMAIL_USER=info@lagentry.com`
   - ❌ Wrong: `EMAIL_USER = info@legendary.ai`
4. **Restart server**: Environment variables are loaded when server starts

### Issue: "Invalid login" error

- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled
- Check that the email address in `EMAIL_USER` matches the account

### Issue: "Connection timeout"

- Check your firewall/network allows SMTP (port 587)
- Try using port 465 with `secure: true`:
  ```env
  EMAIL_PORT=465
  ```

## Testing

After configuration, test by:
1. Submitting the waitlist form
2. Check the server console for email sending logs
3. Check the user's email inbox (and spam folder)

You should see:
```
✅ Waitlist confirmation email sent: <message-id>
```


