const nodemailer = require("nodemailer");

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.hostinger.com";
const EMAIL_PORT = 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Zoya – Founder, Lagentry";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_USER;
const BASE_URL = process.env.FRONTEND_URL || "https://lagentry.com";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASSWORD");
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
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

async function sendDemoConfirmationEmail({ email, name, token }) {
  const rescheduleLink = `${BASE_URL}/reschedule?token=${token}`;
  const cancelLink = `${BASE_URL}/cancel?token=${token}`;

  const html = `
    <p>Hi ${firstName(name)},</p>

    <p><strong>Your Lagentry demo is confirmed!</strong></p>

    <p>
      In the session, I’ll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.
    </p>

    <p>
      You can manage your booking here:
      <br/>
      <a href="${rescheduleLink}">Reschedule Demo</a> |
      <a href="${cancelLink}">Cancel Demo</a>
    </p>

    <p>
      Looking forward to speaking with you!<br><br>
      <strong>Zoya</strong><br>
      CEO, Lagentry
    </p>
  `;

  return sendMailSafe({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Your Lagentry demo is booked! Let’s automate your business!",
    html,
  });
}

module.exports = { sendDemoConfirmationEmail };
