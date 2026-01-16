// Email service for Vercel serverless functions
// This is a copy of server/emailService.js adapted for serverless environment
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

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('❌ Email credentials not configured. Emails will not be sent.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      requireTLS: EMAIL_USE_TLS || EMAIL_PORT === 587,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
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

// Waitlist Confirmation Email
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
    bcc: COMPANY_EMAIL,
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
    text: `Hi ${firstName || 'there'},\n\nYou're officially on the Lagentry waitlist!\n\nI'm Zoya, CEO of Lagentry, and I wanted to personally say hello.\n\nWe're building what we like to call "AI employees" agents that don't just chat, but actually work inside real businesses across MENA.\n\nYou'll hear from us as we open early access, roll out features, and get closer to launch. No noise. No spam. Just real updates.\n\nIf you ever want to share what you're hoping to automate, just reply! I read these myself.\n\nGlad you're here. Really.\n\nZoya\nCEO, Lagentry`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Waitlist confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending waitlist confirmation email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// Newsletter Welcome Email
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
    bcc: COMPANY_EMAIL,
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
    text: `Hi ${firstName || 'there'},\n\nWelcome to Lagentry!\n\nFrom time to time, I'll share how we're building "AI employees" for real businesses in MENA what's working, what isn't, and what's coming next.\n\nThis won't be marketing fluff.\n\nJust honest updates from the ground.\n\nThanks for joining us.\n\nZoya\nCEO, Lagentry`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending newsletter welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Demo Confirmation Email
async function sendDemoConfirmationEmail({ email, name, dateTime, meetingLink, agentName, userRequirement, rescheduleLink, cancelLink }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping demo confirmation email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const formattedDateTime = dateTime || 'Date TBD';

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    replyTo: EMAIL_FROM,
    subject: "Your Lagentry demo is booked! Let's automate your business!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${name || firstName || 'there'},</p>
        <p>Your Lagentry demo is confirmed!</p>
        <p>In the session, I'll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.</p>
        <p>You'll find the meeting details in your calendar invite.</p>
        <p>You can reschedule or cancel anytime if needed.</p>
        <p>Looking forward to speaking with you!</p>
        <p><strong>Zoya</strong><br>CEO, Lagentry</p>
      </div>
    `,
    text: `Hi ${name || firstName || 'there'},\n\nYour Lagentry demo is confirmed!\n\nIn the session, I'll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.\n\nYou'll find the meeting details in your calendar invite.\n\nYou can reschedule or cancel anytime if needed.\n\nLooking forward to speaking with you!\n\nZoya\nCEO, Lagentry`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo confirmation email:', error);
    return { success: false, error: error.message };
  }
}

// Demo Internal Notification
async function sendDemoInternalNotification({ name, email, phone, company, dateTime, agentName, userRequirement }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping internal notification email.');
    return { success: false, error: 'Email not configured' };
  }

  const formattedDateTime = dateTime || 'Date TBD';

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    replyTo: email,
    subject: `New Demo Booking: ${name} - ${formattedDateTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Demo Booking</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
          <p><strong>Agent of Interest:</strong> ${agentName || 'General'}</p>
          ${userRequirement ? `<p><strong>User Requirements:</strong> ${userRequirement}</p>` : ''}
        </div>
      </div>
    `,
    text: `New Demo Booking\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCompany: ${company || 'N/A'}\nDate & Time: ${formattedDateTime}\nAgent of Interest: ${agentName || 'General'}\n${userRequirement ? `User Requirements: ${userRequirement}` : ''}`
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

// Chat Notification Email
async function sendChatNotificationEmail({ conversationId, userMessage, timestamp }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured. Chat notification email not sent.');
    return { success: false, error: 'Email not configured' };
  }

  const adminEmail = COMPANY_EMAIL;
  const chatUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/chats`
    : `https://aganret.com/admin/chats`;

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
      </div>
    `,
    text: `New Chat Conversation\n\nA new conversation has started on the Lagentry website chatbot.\n\nUser Message: ${userMessage}\n\nConversation ID: ${conversationId}\nTime: ${new Date(timestamp).toLocaleString()}\n\nView & Reply: ${chatUrl}`
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
  sendChatNotificationEmail,
  getTransporter
};

