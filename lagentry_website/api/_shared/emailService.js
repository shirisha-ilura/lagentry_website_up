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

/* ---------------- SAFE CALENDAR (.ics) GENERATOR ---------------- */

function generateICS({ name, email, bookingDate, bookingTime }) {
  if (!bookingDate || !bookingTime) {
    console.warn("⚠️ Missing booking date/time, skipping calendar");
    return null;
  }

  const start = new Date(`${bookingDate}T${bookingTime}:00`);

  if (isNaN(start.getTime())) {
    console.warn("⚠️ Invalid date/time format:", bookingDate, bookingTime);
    return null;
  }

  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min demo

  function formatDate(d) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  return `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@lagentry.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:Lagentry Demo Session
DESCRIPTION:Your Lagentry demo is confirmed. We will walk you through real use cases.
ORGANIZER;CN=Zoya:MAILTO:${EMAIL_USER}
ATTENDEE;CN=${name};RSVP=TRUE:MAILTO:${email}
END:VEVENT
END:VCALENDAR
`.trim();
}

/* ---------------- MAIN EMAIL FUNCTION ---------------- */

async function sendDemoConfirmationEmail({
  email,
  name,
  token,
  bookingDate,
  bookingTime,
}) {
  const rescheduleLink = `${BASE_URL}/reschedule?token=${token}`;
  const cancelLink = `${BASE_URL}/cancel?token=${token}`;

  const html = `
    <p>Hi ${firstName(name)},</p>

    <p><strong>Your Lagentry demo is confirmed!</strong></p>

    <p>
      In the session, I’ll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.
    </p>

    <p>
      You’ll find the meeting details in your calendar invite.<br/>
      You can reschedule or cancel anytime if needed.
    </p>

    <p>
      <a href="${rescheduleLink}">Reschedule Demo</a> |
      <a href="${cancelLink}">Cancel Demo</a>
    </p>

    <p>
      Looking forward to speaking with you!<br><br>
      <strong>Zoya</strong><br>
      CEO, Lagentry
    </p>
  `;

  const icsContent = generateICS({ name, email, bookingDate, bookingTime });

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: email,
    bcc: COMPANY_EMAIL,
    subject: "Your Lagentry demo is booked! Let’s automate your business!",
    html,
  };

  // Attach calendar only if valid
  if (icsContent) {
    mailOptions.alternatives = [
      {
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
        content: icsContent,
      },
    ];
  }

  return sendMailSafe(mailOptions);
}

async function sendWaitlistConfirmationEmail({ email, name }) {
  const html = `
    <p>Hi ${name ? name.split(" ")[0] : "there"},</p>

    <p><strong>You’ve successfully joined the Lagentry waitlist!</strong></p>

    <p>
      Thanks for your interest in Lagentry. You’ll be among the first to know when early access is available.
    </p>

    <p>
      Stay tuned for updates 🚀
    </p>

    <p>
      Warm regards,<br><br>
      <strong>Zoya</strong><br>
      CEO, Lagentry
    </p>
  `;

  return sendMailSafe({
    from: `"Zoya – Founder, Lagentry" <${process.env.EMAIL_USER}>`,
    to: email,
    bcc: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
    subject: "You’ve joined the Lagentry waitlist 🚀",
    html,
  });
}




module.exports = {
  sendDemoConfirmationEmail,
  sendWaitlistConfirmationEmail,
};




