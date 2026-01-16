// Email service for Vercel serverless functions (ESM)
import nodemailer from 'nodemailer';

// Environment variables (set in Vercel Project Settings)
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Zoya – Founder, Lagentry';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_FROM;

let transporter = null;

/**
 * Create SMTP transporter (serverless safe)
 * Note: Hostinger SMTP may timeout due to serverless networking
 */
function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error('❌ Email credentials are missing');
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // Hostinger requires true for 465
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
      // Hardening for serverless timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      pool: false, // serverless cannot use pooled connections
      maxConnections: 1,
    });
  }
  return transporter;
}

// Helper function
function getFirstName(name = '') {
  return name.trim().split(' ')[0] || '';
}

/* ===============================
   EMAIL FUNCTIONS
================================ */

export async function sendWaitlistConfirmationEmail({ email, name }) {
  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: email,
      bcc: COMPANY_EMAIL,
      subject: "You're officially in! Welcome to Lagentry 🚀",
      html: `<p>Hi ${getFirstName(name) || 'there'}, welcome to Lagentry!</p>`,
    });
  } catch (err) {
    console.error('Waitlist email failed:', err);
  }
}

export async function sendNewsletterWelcomeEmail({ email, name }) {
  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: email,
      bcc: COMPANY_EMAIL,
      subject: 'Welcome to Lagentry!',
      html: `<p>Hi ${getFirstName(name) || 'there'}, thanks for subscribing!</p>`,
    });
  } catch (err) {
    console.error('Newsletter email failed:', err);
  }
}

export async function sendDemoConfirmationEmail({ email, name }) {
  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: email,
      bcc: COMPANY_EMAIL,
      subject: 'Your Lagentry demo is confirmed',
      html: `<p>Hi ${getFirstName(name) || 'there'}, your demo is booked.</p>`,
    });
  } catch (err) {
    console.error('Demo confirmation email failed:', err);
  }
}

export async function sendDemoInternalNotification({ name, email }) {
  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Demo Booking: ${name}`,
      html: `<p>New demo booking from ${name} (${email})</p>`,
    });
  } catch (err) {
    console.error('Demo internal notification failed:', err);
  }
}

export async function sendChatNotificationEmail({ conversationId, userMessage }) {
  const mailer = getTransporter();
  try {
    return await mailer.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: COMPANY_EMAIL,
      subject: 'New Chat Conversation',
      html: `<p>${userMessage}</p><p>ID: ${conversationId}</p>`,
    });
  } catch (err) {
    console.error('Chat notification email failed:', err);
  }
}

export { getTransporter };
