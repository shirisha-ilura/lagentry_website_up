// Email service for Vercel serverless functions (CommonJS)
const nodemailer = require("nodemailer");

// Environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.hostinger.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Zoya – Founder, Lagentry";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_FROM;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("Email credentials are missing");
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      pool: false,
      maxConnections: 1,
    });
  }
  return transporter;
}

function getFirstName(name = "") {
  return name.trim().split(" ")[0] || "";
}

/* ================= EMAIL FUNCTIONS ================= */

async function sendWaitlistConfirmationEmail({ email, name }) {
  return getTransporter().sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "You're officially in! Welcome to Lagentry 🚀",
    html: `<p>Hi ${getFirstName(name)}, welcome to Lagentry!</p>`,
  });
}

async function sendNewsletterWelcomeEmail({ email, name }) {
  return getTransporter().sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Welcome to Lagentry!",
    html: `<p>Hi ${getFirstName(name)}, thanks for subscribing!</p>`,
  });
}

async function sendDemoConfirmationEmail({ email, name }) {
  return getTransporter().sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Your Lagentry demo is confirmed",
    html: `<p>Hi ${getFirstName(name)}, your demo is booked.</p>`,
  });
}

async function sendDemoInternalNotification({ name, email }) {
  return getTransporter().sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    replyTo: email,
    subject: `New Demo Booking: ${name}`,
    html: `<p>New demo booking from ${name} (${email})</p>`,
  });
}

async function sendChatNotificationEmail({ conversationId, userMessage }) {
  return getTransporter().sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    subject: "New Chat Conversation",
    html: `<p>${userMessage}</p><p>ID: ${conversationId}</p>`,
  });
}

module.exports = {
  sendWaitlistConfirmationEmail,
  sendNewsletterWelcomeEmail,
  sendDemoConfirmationEmail,
  sendDemoInternalNotification,
  sendChatNotificationEmail,
};
