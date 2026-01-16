# Email System Setup Guide

This guide explains how to configure the custom email system for the Lagentry website.

## Overview

The email system uses **nodemailer** to send emails directly from the backend server. All emails are sent using the exact templates provided by Zoya.

## Email Templates Implemented

1. **Waitlist Confirmation Email** - Sent when user joins waitlist
2. **Newsletter Welcome Email** - Sent when user subscribes to newsletter
3. **Demo Confirmation Email (User)** - Sent to user when demo is booked
4. **Demo Confirmation Email (Internal Team)** - Sent to company email when demo is booked
5. **Demo Rescheduled Email** - Sent when demo is rescheduled
6. **Demo Cancelled Email** - Sent when demo is cancelled

## Environment Variables Required

Add these to your `server/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=info@lagentry.com
EMAIL_FROM_NAME=Zoya – Founder, Lagentry
COMPANY_EMAIL=info@lagentry.com
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

3. **Update Environment Variables**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=info@lagentry.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## Alternative Email Providers

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## API Endpoints

### 1. Waitlist (`POST /api/waitlist`)
- Sends waitlist confirmation email automatically
- Stores data in Supabase `waitlist` table

### 2. Newsletter (`POST /api/newsletter`)
- Sends newsletter welcome email automatically
- Stores data in Supabase `newsletter` table (optional)

### 3. Book Demo (`POST /api/book-demo`)
- Sends confirmation email to user
- Sends notification email to internal team
- Stores data in Supabase `user_submissions` table

### 4. Reschedule Demo (`POST /api/reschedule-demo`)
- Sends rescheduled confirmation email
- Updates booking in database

### 5. Cancel Demo (`POST /api/cancel-demo`)
- Sends cancellation email
- Updates booking status in database

## Testing

1. **Test Email Configuration**:
   ```bash
   cd server
   node -e "require('./emailService').getTransporter()"
   ```

2. **Test Waitlist Email**:
   - Submit waitlist form on frontend
   - Check email inbox

3. **Test Newsletter Email**:
   - Click email icon (GmailSection) and submit form
   - Check email inbox

4. **Test Demo Booking**:
   - Book a demo through the form
   - Check both user email and company email

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**:
   ```bash
   cd server
   node -e "console.log(process.env.EMAIL_USER)"
   ```

2. **Check Server Logs**:
   - Look for email-related errors in console
   - Check for "Email transporter not configured" warnings

3. **Gmail Issues**:
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check if "Less secure app access" is needed (older accounts)

4. **Firewall/Network Issues**:
   - Ensure port 587 is not blocked
   - Check if SMTP is allowed in your network

### Common Errors

- **"Invalid login"**: Wrong email or password
- **"Connection timeout"**: Network/firewall issue
- **"Email transporter not configured"**: Missing environment variables

## Email Templates

All email templates are defined in `server/emailService.js` and match the exact drafts provided by Zoya:

- Personal tone from Zoya
- Includes first name personalization
- Professional formatting
- Reply-to set to company email

## Notes

- Emails are sent asynchronously (non-blocking)
- Email failures don't prevent form submissions
- All emails are logged in server console
- Database operations continue even if email fails



