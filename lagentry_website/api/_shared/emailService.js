const nodemailer = require("nodemailer");

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.hostinger.com";
const EMAIL_PORT = 587; // <-- IMPORTANT: use 587 for Vercel
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Zoya – Founder, Lagentry";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_USER;

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASSWORD in env");
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // MUST be false for 587
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

function firstName(name = "") {
  return name.trim().split(" ")[0] || "there";
}

async function sendMailSafe(options) {
  try {
    const info = await getTransporter().sendMail(options);
    console.log("✅ EMAIL SENT:", info.response);
    return info;
  } catch (err) {
    console.error("❌ EMAIL FAILED:", err);
    throw err;
  }
}

async function sendDemoConfirmationEmail({ email, name }) {
  return sendMailSafe({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: email,
    subject: "Your Lagentry demo is confirmed",
    html: `<p>Hi ${firstName(name)}, your demo is booked successfully.</p>`,
  });
}

async function sendDemoInternalNotification({ name, email }) {
  return sendMailSafe({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: COMPANY_EMAIL,
    replyTo: email,
    subject: `New Demo Booking – ${name}`,
    html: `<p>Name: ${name}<br>Email: ${email}</p>`,
  });
}

async function sendChatNotificationEmail({ conversationId, userMessage }) {
  return sendMailSafe({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: COMPANY_EMAIL,
    subject: "New Chat Conversation",
    html: `<p>${userMessage}</p><p>ID: ${conversationId}</p>`,
  });
}

module.exports = {
  sendDemoConfirmationEmail,
  sendDemoInternalNotification,
  sendChatNotificationEmail,
};
