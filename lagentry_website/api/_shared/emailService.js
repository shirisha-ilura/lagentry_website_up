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

/* ---------------- CALENDAR (.ics) ---------------- */

function generateICS({ name, email, bookingDate, bookingTime }) {
  if (!bookingDate || !bookingTime) return null;

  const start = new Date(`${bookingDate}T${bookingTime}:00`);
  if (isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 30 * 60 * 1000);

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
DESCRIPTION:Your Lagentry demo is confirmed.
ORGANIZER;CN=Lagentry:MAILTO:${EMAIL_USER}
ATTENDEE;CN=${name};RSVP=TRUE:MAILTO:${email}
END:VEVENT
END:VCALENDAR
`.trim();
}

/* =========================================================
   DEMO BOOKING - USER EMAIL
========================================================= */

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
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Hi ${firstName(name)},</p>

    <p><strong>Your Lagentry demo is successfully confirmed.</strong></p>

    <p>
      During the session, we will walk you through how Lagentry AI agents operate in real production environments, beyond typical demos and buzzwords.
    </p>

    <p>
      You will find the session added to your calendar via the attached invite.
    </p>

    <p>
      You may manage your booking anytime here:
      <br/>
      <a href="${rescheduleLink}">Reschedule Demo</a> | 
      <a href="${cancelLink}">Cancel Demo</a>
    </p>

    <p>
      We look forward to speaking with you.
    </p>

    <p>
      Warm regards,<br/>
      <strong>Zoya</strong><br/>
      Founder & CEO<br/>
      Lagentry
    </p>
  </div>
  `;

  const icsContent = generateICS({ name, email, bookingDate, bookingTime });

  const mailOptions = {
    from: `"Lagentry" <${EMAIL_USER}>`,
    to: email,
    subject: "Your Lagentry Demo is Confirmed",
    html,
  };

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

/* =========================================================
   DEMO BOOKING - ADMIN EMAIL
========================================================= */

async function sendDemoAdminNotification(data) {
  const html = `
  <div style="font-family: Arial, sans-serif;">
    <h3>New Demo Booking</h3>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Date:</strong> ${data.bookingDate}</p>
    <p><strong>Time:</strong> ${data.bookingTime}</p>
    <p><strong>Source:</strong> Website Booking Form</p>
  </div>
  `;

  return sendMailSafe({
    from: `"Lagentry Notifications" <${EMAIL_USER}>`,
    to: COMPANY_EMAIL,
    subject: `New Demo Booking – ${data.name}`,
    html,
  });
}

/* =========================================================
   WAITLIST - USER EMAIL
========================================================= */

async function sendWaitlistConfirmationEmail({ email, name }) {
  const html = `
  <div style="font-family: Arial, sans-serif;">
    <p>Hi ${firstName(name)},</p>

    <p><strong>Thank you for joining the Lagentry waitlist.</strong></p>

    <p>
      We appreciate your interest in Lagentry. You will be among the first to receive updates when early access becomes available.
    </p>

    <p>
      Warm regards,<br/>
      <strong>Zoya</strong><br/>
      Founder & CEO<br/>
      Lagentry
    </p>
  </div>
  `;

  return sendMailSafe({
    from: `"Lagentry" <${EMAIL_USER}>`,
    to: email,
    subject: "You’re on the Lagentry Waitlist",
    html,
  });
}

/* =========================================================
   WAITLIST - ADMIN EMAIL
========================================================= */

async function sendWaitlistAdminNotification({ email, name }) {
  const html = `
  <div style="font-family: Arial, sans-serif;">
    <h3>New Waitlist Signup</h3>
    <p><strong>Name:</strong> ${name || "N/A"}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Source:</strong> Website Waitlist Form</p>
  </div>
  `;

  return sendMailSafe({
    from: `"Lagentry Notifications" <${EMAIL_USER}>`,
    to: COMPANY_EMAIL,
    subject: `New Waitlist Signup – ${email}`,
    html,
  });
}

/* =========================================================
   NEWSLETTER - USER EMAIL
========================================================= */

async function sendNewsletterWelcomeEmail({ email, name }) {
  const html = `
  <div style="font-family: Arial, sans-serif;">
    <p>Hi ${firstName(name)},</p>

    <p><strong>Welcome to the Lagentry newsletter.</strong></p>

    <p>
      You are now subscribed to receive product updates, insights, and announcements from the Lagentry team.
    </p>

    <p>
      We’re glad to have you with us.
    </p>

    <p>
      Regards,<br/>
      <strong>Zoya</strong><br/>
      Founder & CEO<br/>
      Lagentry
    </p>
  </div>
  `;

  return sendMailSafe({
    from: `"Lagentry" <${EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Lagentry",
    html,
  });
}

/* =========================================================
   NEWSLETTER - ADMIN EMAIL
========================================================= */

async function sendNewsletterAdminNotification({ email, name }) {
  const html = `
  <div style="font-family: Arial, sans-serif;">
    <h3>New Newsletter Subscriber</h3>
    <p><strong>Name:</strong> ${name || "N/A"}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Source:</strong> Website Newsletter Form</p>
  </div>
  `;

  return sendMailSafe({
    from: `"Lagentry Notifications" <${EMAIL_USER}>`,
    to: COMPANY_EMAIL,
    subject: `New Newsletter Subscriber – ${email}`,
    html,
  });
}

/* ========================================================= */

module.exports = {
  sendDemoConfirmationEmail,
  sendDemoAdminNotification,
  sendWaitlistConfirmationEmail,
  sendWaitlistAdminNotification,
  sendNewsletterWelcomeEmail,
  sendNewsletterAdminNotification,
};
