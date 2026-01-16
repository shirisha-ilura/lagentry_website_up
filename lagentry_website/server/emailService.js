require('dotenv').config();
const nodemailer = require('nodemailer');

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT) || 587;
const EMAIL_USE_TLS = process.env.EMAIL_USE_TLS === 'true' || process.env.EMAIL_USE_TLS === true;
const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL_FROM;
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || 'info@lagentry.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Zoya – Founder, Lagentry';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@lagentry.com';

// Debug: Log email configuration status (without exposing passwords)
console.log('📧 Email Configuration Status:');
console.log('  EMAIL_HOST:', EMAIL_HOST);
console.log('  EMAIL_PORT:', EMAIL_PORT);
console.log('  EMAIL_USE_TLS:', EMAIL_USE_TLS);
console.log('  EMAIL_USER:', EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}***` : 'NOT SET');
console.log('  EMAIL_PASS:', EMAIL_PASS ? '***SET***' : 'NOT SET');
console.log('  EMAIL_FROM:', EMAIL_FROM);
console.log('  COMPANY_EMAIL:', COMPANY_EMAIL);

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('❌ Email credentials not configured. Emails will not be sent.');
      console.error('Please add these to your server/.env file:');
      console.error('  EMAIL_USER=your-email@gmail.com');
      console.error('  EMAIL_PASSWORD=your-gmail-app-password');
      console.error('  EMAIL_FROM=info@lagentry.com');
      console.error('  EMAIL_FROM_NAME=Zoya – Founder, Lagentry');
      console.error('  COMPANY_EMAIL=info@lagentry.com');
      console.error('');
      console.error('For Gmail: Enable 2FA and generate an App Password at:');
      console.error('https://myaccount.google.com/apppasswords');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      requireTLS: EMAIL_USE_TLS || EMAIL_PORT === 587, // Use TLS for port 587 or if explicitly set
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

// Helper function to extract first name
function getFirstName(name) {
  if (!name || !name.trim()) return '';
  return name.trim().split(' ')[0];
}

// Helper function to format date for iCal (UTC format)
function formatDateForICal(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Convert to UTC and format as YYYYMMDDTHHMMSSZ
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// Helper function to escape text for iCal
function escapeICalText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Helper function to generate iCal calendar invite
function generateICalInvite({ title, description, location, start, end, organizerEmail, organizerName, attendeeEmail, attendeeName }) {
  const startFormatted = formatDateForICal(start);
  const endFormatted = formatDateForICal(end);
  const now = formatDateForICal(new Date());
  const uid = `lagentry-demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@lagentry.com`;
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lagentry//Demo Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:${escapeICalText(title)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    `LOCATION:${escapeICalText(location)}`,
    `ORGANIZER;CN=${escapeICalText(organizerName)}:MAILTO:${organizerEmail}`,
    `ATTENDEE;CN=${escapeICalText(attendeeName)};RSVP=TRUE:MAILTO:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeICalText(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icalContent;
}

// Helper function to format date and time
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'Date TBD';
  
  try {
    let date;
    
    // Handle different date formats
    if (typeof dateTimeString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateTimeString);
      
      // If invalid, try other formats
      if (isNaN(date.getTime())) {
        // Try parsing as date + time separately
        const parts = dateTimeString.split('T');
        if (parts.length > 1) {
          date = new Date(dateTimeString);
        }
      }
    } else if (dateTimeString instanceof Date) {
      date = dateTimeString;
    } else {
      date = new Date(dateTimeString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided:', dateTimeString);
      return 'Date TBD';
    }
    
    // Format the date
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateTimeString);
    return 'Date TBD';
  }
}

/**
 * 1. Waitlist Confirmation Email
 */
async function sendWaitlistConfirmationEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping waitlist email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "You're officially in! Welcome to Lagentry 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>You're officially on the Lagentry waitlist!</p>
        
        <p>I'm Zoya, CEO of Lagentry, and I wanted to personally say hello.</p>
        
        <p>We're building what we like to call "AI employees" agents that don't just chat, but actually work inside real businesses across MENA.</p>
        
        <p>You'll hear from us as we open early access, roll out features, and get closer to launch. No noise. No spam. Just real updates.</p>
        
        <p>If you ever want to share what you're hoping to automate, just reply! I read these myself.</p>
        
        <p>Glad you're here. Really.</p>
        
        <p><strong>Zoya</strong><br>CEO, Lagentry</p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

You're officially on the Lagentry waitlist!

I'm Zoya, CEO of Lagentry, and I wanted to personally say hello.

We're building what we like to call "AI employees" agents that don't just chat, but actually work inside real businesses across MENA.

You'll hear from us as we open early access, roll out features, and get closer to launch. No noise. No spam. Just real updates.

If you ever want to share what you're hoping to automate, just reply! I read these myself.

Glad you're here. Really.

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send waitlist confirmation email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    console.log('   Subject:', mailOptions.subject);
    console.log('   First Name:', firstName || 'N/A');
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Waitlist confirmation email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending waitlist confirmation email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    if (error.responseCode) {
      console.error('   Response Code:', error.responseCode);
    }
    if (error.command) {
      console.error('   Failed Command:', error.command);
    }
    console.error('   Full error object:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * 2. Newsletter Signup Email
 */
async function sendNewsletterWelcomeEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping newsletter email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Welcome to Lagentry! Let's build this right",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>Welcome to Lagentry!</p>
        
        <p>From time to time, I'll share how we're building "AI employees" for real businesses in MENA what's working, what isn't, and what's coming next.</p>
        
        <p>This won't be marketing fluff.</p>
        
        <p>Just honest updates from the ground.</p>
        
        <p>Thanks for joining us.</p>
        
        <p><strong>Zoya</strong><br>CEO, Lagentry</p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

Welcome to Lagentry!

From time to time, I'll share how we're building "AI employees" for real businesses in MENA what's working, what isn't, and what's coming next.

This won't be marketing fluff.

Just honest updates from the ground.

Thanks for joining us.

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send newsletter welcome email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending newsletter welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Demo Booked - User Confirmation Email
 */
async function sendDemoConfirmationEmail({ email, name, dateTime, meetingLink, agentName, userRequirement, rescheduleLink, cancelLink }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping demo confirmation email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const formattedDateTime = formatDateTime(dateTime);
  
  // Parse dateTime to get start and end dates for calendar invite
  let startDate, endDate;
  try {
    if (dateTime instanceof Date) {
      startDate = new Date(dateTime);
    } else if (typeof dateTime === 'string') {
      startDate = new Date(dateTime);
    } else {
      startDate = new Date(dateTime);
    }
    
    if (isNaN(startDate.getTime())) {
      console.warn('⚠️ Invalid dateTime provided for calendar invite:', dateTime);
      startDate = null;
      endDate = null;
    } else {
      // Set end date to 1 hour after start
      endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      console.log('📅 Parsed dates for calendar invite:', {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        originalDateTime: dateTime
      });
    }
  } catch (error) {
    console.error('❌ Error parsing dateTime for calendar invite:', error);
    startDate = null;
    endDate = null;
  }
  
  // Use provided reschedule and cancel links, or generate them if not provided
  let finalRescheduleLink = rescheduleLink;
  let finalCancelLink = cancelLink;
  
  // Only generate links if they weren't provided
  if (!finalRescheduleLink || !finalCancelLink) {
    let backendUrl = process.env.BACKEND_URL || process.env.SERVER_URL;
    if (!backendUrl) {
      // Try to use Vercel URL if available
      if (process.env.VERCEL_URL) {
        // Vercel deployment - use the VERCEL_URL environment variable
        backendUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.VERCEL) {
        // Vercel deployment - use the default backend URL
        backendUrl = 'https://lagentry-backend.vercel.app';
      } else {
        // Fallback to production URL, never use localhost
        backendUrl = process.env.FRONTEND_URL || 'https://lagentry.com';
      }
    }
    finalRescheduleLink = finalRescheduleLink || `${backendUrl}/reschedule-demo?email=${encodeURIComponent(email)}`;
    finalCancelLink = finalCancelLink || `${backendUrl}/cancel-demo?email=${encodeURIComponent(email)}`;
  }
  
  // Debug: Log the links being used
  console.log('🔗 Reschedule/Cancel Links:', {
    finalRescheduleLink: finalRescheduleLink,
    finalCancelLink: finalCancelLink,
    providedRescheduleLink: rescheduleLink,
    providedCancelLink: cancelLink,
    usingProvidedLinks: !!(rescheduleLink && cancelLink)
  });

  // Generate calendar invite attachment if we have valid dates
  const attachments = [];
  if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    try {
      const icalContent = generateICalInvite({
        title: 'Lagentry Demo',
        description: `Demo session with Lagentry. ${agentName ? `Agent of Interest: ${agentName}.` : ''} ${userRequirement ? `Notes: ${userRequirement}` : ''} Meeting Link: ${meetingLink || 'TBD'}`,
        location: 'Online',
        start: startDate,
        end: endDate,
        organizerEmail: EMAIL_FROM,
        organizerName: EMAIL_FROM_NAME,
        attendeeEmail: email,
        attendeeName: name || firstName || 'Guest'
      });
      
      attachments.push({
        filename: 'lagentry-demo.ics',
        content: icalContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        contentDisposition: 'attachment'
      });
      
      console.log('✅ Calendar invite generated and attached to email');
      console.log('   Filename: lagentry-demo.ics');
      console.log('   Content length:', icalContent.length, 'bytes');
    } catch (error) {
      console.error('❌ Error generating calendar invite:', error);
      console.error('   Error stack:', error.stack);
      // Continue without calendar invite if generation fails
    }
  } else {
    console.warn('⚠️ Cannot generate calendar invite: invalid or missing date/time');
    console.warn('   startDate:', startDate);
    console.warn('   endDate:', endDate);
    console.warn('   dateTime provided:', dateTime);
  }

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Your Lagentry demo is booked! Let's automate your business!",
    attachments: attachments.length > 0 ? attachments : [],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${name || firstName || 'there'},</p>
        
        <p>Your Lagentry demo is confirmed!</p>
        
        <p>In the session, I'll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.</p>
        
        <p>You'll find the meeting details in your calendar invite.</p>
        
        <p>You can reschedule or cancel anytime if needed.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${finalRescheduleLink}" style="display: inline-block; background-color: #8B5CF6; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 0 10px; font-weight: 600; font-size: 16px; border: none;">🔄 Reschedule</a>
          <a href="${finalCancelLink}" style="display: inline-block; background-color: #ef4444; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 0 10px; font-weight: 600; font-size: 16px; border: none;">❌ Cancel</a>
        </div>
        
        <p>Looking forward to speaking with you!</p>
        
        <p><strong>Zoya</strong><br>CEO, Lagentry</p>
      </div>
    `,
    text: `
Hi ${name || firstName || 'there'},

Your Lagentry demo is confirmed!

In the session, I'll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.

You'll find the meeting details in your calendar invite.

You can reschedule or cancel anytime if needed.

Reschedule your demo: ${finalRescheduleLink}
Cancel your demo: ${finalCancelLink}

Looking forward to speaking with you!

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send demo confirmation email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo confirmation email sent to user:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3b. Demo Booked - Internal Team Notification Email
 */
async function sendDemoInternalNotification({ name, email, phone, company, companySize, dateTime, meetingLink, agentName, userRequirement }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping internal notification email.');
    return { success: false, error: 'Email not configured' };
  }

  const formattedDateTime = formatDateTime(dateTime);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    replyTo: email, // Reply-to set to user's email
    subject: `New Demo Booking: ${name} - ${formattedDateTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Demo Booking</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Company Size:</strong> ${companySize || 'N/A'}</p>
          <p><strong>Date & Time:</strong> ${formattedDateTime || dateTime}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink || '#'}">${meetingLink || 'TBD'}</a></p>
          <p><strong>Agent of Interest:</strong> ${agentName || 'General'}</p>
          ${userRequirement ? `<p><strong>User Requirements:</strong> ${userRequirement}</p>` : ''}
        </div>
      </div>
    `,
    text: `
New Demo Booking

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Company: ${company || 'N/A'}
Company Size: ${companySize || 'N/A'}
Date & Time: ${formattedDateTime || dateTime}
Meeting Link: ${meetingLink || 'TBD'}
Agent of Interest: ${agentName || 'General'}
${userRequirement ? `User Requirements: ${userRequirement}` : ''}
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo internal notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo internal notification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Demo Rescheduled Email
 */
async function sendDemoRescheduledEmail({ email, name, dateTime, meetingLink }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping reschedule email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const formattedDateTime = formatDateTime(dateTime);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Your Lagentry Demo Has Been Rescheduled 🔄",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>Your demo has been successfully rescheduled.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>New Date & Time:</strong> ${formattedDateTime || 'Date TBD'}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink || '#'}" style="color: #0066cc; text-decoration: none;">${meetingLink || 'TBD'}</a></p>
        </div>
        
        <p>Looking forward to it.</p>
        
        <p>— Zoya</p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

Your demo has been successfully rescheduled.

New Date & Time: ${formattedDateTime || 'Date TBD'}
Meeting Link: ${meetingLink || 'TBD'}

Looking forward to it.

— Zoya
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo rescheduled email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo rescheduled email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Demo Cancelled Email
 */
async function sendDemoCancelledEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping cancellation email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const baseUrl = process.env.FRONTEND_URL || 'https://lagentry.com' || 'http://localhost:3000';
  const bookAgainLink = `${baseUrl}/book-demo`;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Demo Cancelled – Hope to See You Again",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>I noticed you cancelled your demo — no worries at all.</p>
        
        <p>If you ever want to reconnect, feel free to reach us at ${COMPANY_EMAIL} or simply <a href="${bookAgainLink}" style="color: #0066cc; text-decoration: none;">book again</a> when the time feels right.</p>
        
        <p>Wishing you the best,</p>
        
        <p><strong>Zoya</strong></p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

I noticed you cancelled your demo — no worries at all.

If you ever want to reconnect, feel free to reach us at ${COMPANY_EMAIL} or simply book again when the time feels right.

Wishing you the best,

Zoya
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo cancelled email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo cancelled email:', error);
    return { success: false, error: error.message };
  }
}

// Send chat notification email to admin
async function sendChatNotificationEmail({ conversationId, userMessage, timestamp }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured. Chat notification email not sent.');
    return { success: false, error: 'Email not configured' };
  }

  const adminEmail = COMPANY_EMAIL;
  const chatUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/chats`
    : `http://localhost:3000/admin/chats`;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: adminEmail,
    replyTo: EMAIL_FROM,
    subject: `New Chat Conversation - Lagentry Website`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #9b5cff;">New Chat Conversation</h2>
        
        <p>A new conversation has started on the Lagentry website chatbot.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>User Message:</strong></p>
          <p style="margin: 0; color: #333;">${userMessage}</p>
        </div>
        
        <p><strong>Conversation ID:</strong> ${conversationId}</p>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        
        <div style="margin: 30px 0;">
          <a href="${chatUrl}" 
             style="background: #9b5cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View & Reply in Admin Panel
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          You can reply directly from the admin panel. The bot will stop responding once you take over.
        </p>
      </div>
    `,
    text: `
New Chat Conversation

A new conversation has started on the Lagentry website chatbot.

User Message: ${userMessage}

Conversation ID: ${conversationId}
Time: ${new Date(timestamp).toLocaleString()}

View & Reply: ${chatUrl}

You can reply directly from the admin panel. The bot will stop responding once you take over.
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Chat notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending chat notification email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWaitlistConfirmationEmail,
  sendNewsletterWelcomeEmail,
  sendDemoConfirmationEmail,
  sendDemoInternalNotification,
  sendDemoRescheduledEmail,
  sendDemoCancelledEmail,
  sendChatNotificationEmail,
  getTransporter
};

