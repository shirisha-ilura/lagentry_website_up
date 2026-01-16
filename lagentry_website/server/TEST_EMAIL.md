# Testing Email Configuration

## Quick Test Steps

1. **Make sure your server is running** with the updated code
2. **Check server console** when you submit the waitlist form
3. **Look for these log messages**:

### Success Messages (Email Sent):
```
📧 Email Configuration Status:
  EMAIL_HOST: smtp.hostinger.com
  EMAIL_PORT: 587
  EMAIL_USE_TLS: true
  EMAIL_USER: inf***
  EMAIL_PASS: ***SET***
  EMAIL_FROM: info@lagentry.com
  COMPANY_EMAIL: info@lagentry.com

📧 Attempting to send waitlist confirmation email to: your-email@example.com
📧 Preparing to send waitlist email...
   To: your-email@example.com
   From: info@lagentry.com
   Subject: You're on the Lagentry waitlist 🚀
✅ Waitlist confirmation email sent successfully!
   Message ID: <some-id>
   Response: 250 OK
```

### Error Messages (Email Failed):
```
❌ Email credentials not configured. Emails will not be sent.
```
OR
```
❌ Error sending waitlist confirmation email:
   Error message: Invalid login
   Error code: EAUTH
```

## Common Issues & Solutions

### Issue 1: "Email credentials not configured"
**Solution**: Make sure `.env` file exists in `server/` folder with correct values

### Issue 2: "Invalid login" or "Authentication failed"
**Solution**: 
- Verify email password is correct in `.env`
- Check that `info@lagentry.com` account exists in Hostinger
- Make sure password has no extra spaces

### Issue 3: "Connection timeout"
**Solution**:
- Check firewall allows SMTP (port 587)
- Verify Hostinger SMTP server is accessible
- Try port 465 instead (change `EMAIL_PORT=465` in `.env`)

### Issue 4: Email sent but not received
**Solution**:
- Check spam/junk folder
- Wait a few minutes (email delivery can be delayed)
- Verify the email address is correct
- Check Hostinger email logs/dashboard

## Debugging Steps

1. **Restart your server** after creating/updating `.env`:
   ```bash
   cd server
   npm start
   ```

2. **Watch the console** when submitting waitlist form

3. **Check the logs** - you should see detailed email sending information

4. **Test with a different email** to rule out email-specific issues

5. **Check Hostinger email dashboard** to see if emails are being sent from their side

## What to Share for Further Debugging

If emails still don't work, share:
1. The **exact console output** when you submit the waitlist form
2. Any **error messages** you see
3. Whether you see "✅ Waitlist confirmation email sent successfully!" or error messages

