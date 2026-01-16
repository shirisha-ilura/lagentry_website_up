// Email service for Vercel serverless functions (ESM-compatible)
import nodemailer from 'nodemailer';

// NOTE:
// ❌ Do NOT use dotenv on Vercel
// Vercel automatically provides process.env

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL_FROM;
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || 'info@lagentry.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Zoya – Founder, Lagentry';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_FROM;

// Reusable transporter (safe in serverless)
let transporter;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error('Email credentials are missing');
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // Hostinger = true
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
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
    html: `<p>Hi ${getFirstName(name)}, welcome to Lagentry!</p>`,
  });
}

export async function sendNewsletterWelcomeEmail({ email, name }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Welcome to Lagentry!",
    html: `<p>Hi ${getFirstName(name)}, thanks for subscribing!</p>`,
  });
}

export async function sendDemoConfirmationEmail({ email, name }) {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Your Lagentry demo is confirmed",
    html: `<p>Hi ${getFirstName(name)}, your demo is booked.</p>`,
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
