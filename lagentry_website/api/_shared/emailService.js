// Email service for Vercel serverless functions (ESM)
import nodemailer from 'nodemailer';

// Environment variables (provided by Vercel)
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Zoya – Founder, Lagentry';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_FROM;

let transporter;

/**
 * Create SMTP transporter (NO pooling – serverless safe)
 */
function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error('❌ Email credentials are missing');
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // REQUIRED for Hostinger
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },

      // 🔐 TLS REQUIRED for Hostinger
      tls: {
        rejectUnauthorized: false,
      },

      // ⏱ Prevent hanging serverless execution
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      // ❌ DO NOT enable pooling on Vercel
      pool: false,
    });
  }

  return transporter;
}

// Helper
function getFirstName(name = '') {
  return name.trim().split(' ')[0] || '';
}

/* ===============================
   EMAIL FUNCTIONS
================================ */

export async function sendWaitlistConfirmationEmail({ email, name }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "You're officially in! Welcome to Lagentry 🚀",
    html: `<p>Hi ${getFirstName(name) || 'there'}, welcome to Lagentry!</p>`,
  });
}

export async function sendNewsletterWelcomeEmail({ email, name }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: 'Welcome to Lagentry!',
    html: `<p>Hi ${getFirstName(name) || 'there'}, thanks for subscribing!</p>`,
  });
}

export async function sendDemoConfirmationEmail({ email, name }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: 'Your Lagentry demo is confirmed',
    html: `<p>Hi ${getFirstName(name) || 'there'}, your demo is booked.</p>`,
  });
}

export async function sendDemoInternalNotification({ name, email }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    replyTo: email,
    subject: `New Demo Booking: ${name}`,
    html: `<p>New demo booking from ${name} (${email})</p>`,
  });
}

export async function sendChatNotificationEmail({ conversationId, userMessage }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    subject: 'New Chat Conversation',
    html: `<p>${userMessage}</p><p>ID: ${conversationId}</p>`,
  });
}

export { getTransporter };
