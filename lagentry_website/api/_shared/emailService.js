const nodemailer = require("nodemailer");

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.hostinger.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT) || 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === true || (EMAIL_PORT === 465);
const EMAIL_USE_TLS = process.env.EMAIL_USE_TLS === 'true' || process.env.EMAIL_USE_TLS === true;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Lagentry";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_USER;
const BASE_URL = process.env.FRONTEND_URL || "https://lagentry.com";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASSWORD missing");
    throw new Error("Missing EMAIL_USER or EMAIL_PASSWORD");
  }

  console.log(`📧 Creating SMTP Transporter: ${EMAIL_HOST}:${EMAIL_PORT} (secure: ${EMAIL_SECURE}, useTLS: ${EMAIL_USE_TLS})`);
  console.log(`📧 Authenticating as: ${EMAIL_USER ? EMAIL_USER.substring(0, 3) + '...' : 'NONE'}`);

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    requireTLS: EMAIL_USE_TLS || EMAIL_PORT === 587,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      // Hostinger often requires this for certain environments
      minVersion: 'TLSv1.2'
    },
  });

  return transporter;
}

function firstName(name = "") {
  return name.trim().split(" ")[0] || "there";
}

// Public URL helper (for hero images in emails)
function getPublicBaseUrl() {
  return (BASE_URL || "https://lagentry.com").replace(/\/+$/, "");
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

// Helper function to format date and time for display
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'Date TBD';

  try {
    let date;
    if (typeof dateTimeString === 'string') {
      let cleanString = dateTimeString.replace(/\s+at\s+/i, ' ').trim();
      date = new Date(cleanString);
      if (isNaN(date.getTime())) {
        date = new Date(dateTimeString);
      }
    } else if (dateTimeString instanceof Date) {
      date = dateTimeString;
    } else {
      date = new Date(dateTimeString);
    }

    if (isNaN(date.getTime())) {
      return 'Date TBD';
    }

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
    return 'Date TBD';
  }
}

/**
 * Shared HTML layout for user-facing emails (waitlist, newsletter, demo, etc.)
 * Uses table-based structure and inline styles for good email client support.
 */
function buildBrandedEmailTemplate({
  preheader = "",
  eyebrow = "",
  title = "",
  greeting = "",
  bodyHtml = "",
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  highlightText,
  heroImageUrl,
  footerNote,
  accentColor = "#F97316",
}) {
  const baseUrl = getPublicBaseUrl();
  const safeHero =
    heroImageUrl || `${baseUrl}/images/email/lagentry-hero-default.png`;
  const safePreheader = (preheader || title || "").replace(/"/g, "'");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || "Lagentry"}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .wrapper { width: 100% !important; }
        .card { padding: 24px 18px !important; }
        .hero-title { font-size: 24px !important; line-height: 1.2 !important; }
        .cta-container { display: block !important; }
        .cta-cell { 
          display: block !important; 
          width: 100% !important; 
          padding: 0 0 12px 0 !important; 
        }
        .cta-primary, .cta-secondary {
          display: block !important;
          width: 100% !important;
          margin: 0 0 12px 0 !important;
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#020617; background-image:radial-gradient(circle at top, rgba(248,250,252,0.06), transparent 55%), radial-gradient(circle at bottom, rgba(79,70,229,0.18), transparent 60%); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; visibility:hidden; mso-hide:all;">
      ${safePreheader}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:transparent; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrapper" style="width:600px; max-width:100%;">
            <tr>
              <td align="left" style="padding:0 24px 16px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="left">
                      <span style="font-size:14px; letter-spacing:0.18em; text-transform:uppercase; color:#F9FAFB;">LAGENTRY</span>
                    </td>
                    <td align="right">
                      <span style="font-size:11px; color:#9CA3AF;">AI Employees for MENA</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:10px;">
                      <div style="height:3px; width:100%; border-radius:999px; background:linear-gradient(90deg, ${accentColor}, #22c55e, #0ea5e9);"></div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius:24px; overflow:hidden; background:radial-gradient(circle at top left, rgba(248,250,252,0.08), transparent 55%), radial-gradient(circle at bottom right, rgba(148,163,184,0.16), transparent 60%), #020617; border:1px solid rgba(148,163,184,0.35);" class="card">
                  <tr>
                    <td align="center" style="padding:0; border-bottom:1px solid rgba(148,163,184,0.16);">
                      <img src="${safeHero}" width="600" alt="Lagentry" style="display:block; width:100%; max-width:600px; height:auto; border:0; outline:none; text-decoration:none;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 28px 10px 28px;">
                      ${eyebrow
      ? `<div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:${accentColor}; margin-bottom:8px;">${eyebrow}</div>`
      : ""
    }
                      <div class="hero-title" style="font-size:28px; line-height:1.25; font-weight:700; color:#F9FAFB; margin:0 0 12px 0;">
                        ${title}
                      </div>
                      ${highlightText
      ? `<div style="margin:0 0 14px 0; font-size:13px; color:#E5E7EB;">
                          <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:rgba(15,23,42,0.9); border:1px solid rgba(148,163,184,0.45); font-size:12px;">
                            ⭐ ${highlightText}
                          </span>
                        </div>`
      : ""
    }
                      ${greeting
      ? `<p style="margin:0 0 10px 0; font-size:14px; line-height:1.6; color:#E5E7EB;">${greeting}</p>`
      : ""
    }
                      <div style="font-size:14px; line-height:1.7; color:#E5E7EB; margin:0 0 4px 0;">
                        ${bodyHtml}
                      </div>
                    </td>
                  </tr>

                  ${(primaryCtaLabel && primaryCtaUrl) ||
      (secondaryCtaLabel && secondaryCtaUrl)
      ? `<tr>
                    <td align="center" style="padding:4px 28px 24px 28px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="cta-container" style="width:100%;">
                        <tr>
                          ${primaryCtaLabel && primaryCtaUrl
        ? `<td align="center" class="cta-cell" style="padding:0 6px 8px 0; width:auto;">
                            <a href="${primaryCtaUrl}" class="cta-primary" style="background-color:${accentColor}; color:#0B1020 !important; text-decoration:none; padding:11px 22px; border-radius:999px; font-size:13px; font-weight:600; display:inline-block; border:none;">
                              ✨ ${primaryCtaLabel}
                            </a>
                          </td>`
        : ""
      }
                          ${secondaryCtaLabel && secondaryCtaUrl
        ? `<td align="center" class="cta-cell" style="padding:0 0 8px 6px; width:auto;">
                            <a href="${secondaryCtaUrl}" class="cta-secondary" style="background-color:transparent; color:#E5E7EB !important; text-decoration:none; padding:10px 18px; border-radius:999px; font-size:13px; font-weight:500; display:inline-block; border:1px solid rgba(148,163,184,0.55);">
                              ${secondaryCtaLabel}
                            </a>
                          </td>`
        : ""
      }
                        </tr>
                      </table>
                    </td>
                  </tr>`
      : ""
    }

                  <tr>
                    <td style="padding:0 28px 26px 28px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:11px; color:#9CA3AF; line-height:1.6;">
                            <div style="margin-bottom:6px;">
                              <strong style="color:#E5E7EB;">Zoya</strong><br />
                              CEO, Lagentry
                            </div>
                            ${footerNote || ""}
                          </td>
                          <td align="right" style="font-size:11px; color:#6B7280;">
                            <div style="margin-bottom:4px;">⭐ Built for operators, not hobbyists.</div>
                            <div>More at <a href="${baseUrl}" style="color:#A855F7; text-decoration:none;">lagentry.com</a></div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:18px 16px 8px 16px;">
                <div style="font-size:10px; line-height:1.5; color:#6B7280; max-width:520px; margin:0 auto;">
                  You’re receiving this email because you interacted with Lagentry (demo booking, waitlist, or newsletter). If this wasn’t you, you can safely ignore this message.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
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

/* =========================================================
   DEMO BOOKING - USER EMAIL
========================================================= */

async function sendDemoConfirmationEmail({
  email,
  name,
  token,
  bookingDate,
  bookingTime,
  agentName,
  userRequirement,
  rescheduleLink: providedRescheduleLink,
  cancelLink: providedCancelLink,
}) {
  const firstNameStr = firstName(name);

  // Parse dates for calendar invite
  let startDate, endDate;
  try {
    startDate = new Date(`${bookingDate}T${bookingTime}:00`);
    if (isNaN(startDate.getTime())) {
      // Fallback if bookingDate is already an ISO string or similar
      startDate = new Date(bookingDate);
    }

    if (!isNaN(startDate.getTime())) {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour
    }
  } catch (e) {
    console.warn("Failed to parse dates for iCal", e);
  }

  const rescheduleLink = providedRescheduleLink || `${BASE_URL}/reschedule?token=${token}`;
  const cancelLink = providedCancelLink || `${BASE_URL}/cancel?token=${token}`;
  const formattedDateTime = formatDateTime(startDate || bookingDate);

  const html = buildBrandedEmailTemplate({
    preheader: "Your Lagentry demo is confirmed. Calendar invite is attached.",
    eyebrow: "DEMO CONFIRMED",
    title: "Your Lagentry demo is locked in ✅",
    greeting: `Hi ${name || firstNameStr || 'there'},`,
    highlightText: formattedDateTime ? `You’re meeting with us on ${formattedDateTime}.` : "Your demo is scheduled and ready.",
    heroImageUrl: `${getPublicBaseUrl()}/images/email/demo-hero.png`,
    bodyHtml: `
      <p style="margin:0 0 10px 0;">Your session is confirmed. In this demo, we’ll walk through how Lagentry’s <strong>AI employees</strong> plug into real workflows — not just chat widgets.</p>
      <p style="margin:0 0 10px 0;">
        ⭐ Live walkthrough of agents like <strong>${agentName || 'Lead Qualification & Support'}</strong><br/>
        ⭐ How teams in MENA are using them in production<br/>
        ${userRequirement ? `⭐ A quick deep-dive on what you shared: <em>${userRequirement}</em><br/>` : ''}
      </p>
      <p style="margin:0 0 10px 0;">All the exact meeting details are in the attached calendar invite.</p>
      <p style="margin:0;">If the timing stops working, you can move or cancel your slot in one click below.</p>
    `,
    primaryCtaLabel: "🔄 Reschedule demo",
    primaryCtaUrl: rescheduleLink,
    secondaryCtaLabel: "❌ Cancel demo",
    secondaryCtaUrl: cancelLink,
    footerNote: "If these links don’t work for any reason, just reply to this email and we’ll adjust your booking manually.",
    accentColor: "#8B5CF6"
  });

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to: email,
    subject: "Your Lagentry Demo is Confirmed",
    html,
  };

  if (startDate && endDate) {
    const icsContent = generateICalInvite({
      title: 'Lagentry Demo',
      description: `Demo session with Lagentry. ${agentName ? `Agent of Interest: ${agentName}.` : ''} ${userRequirement ? `Notes: ${userRequirement}` : ''}`,
      location: 'Online',
      start: startDate,
      end: endDate,
      organizerEmail: EMAIL_USER,
      organizerName: EMAIL_FROM_NAME,
      attendeeEmail: email,
      attendeeName: name || firstNameStr || 'Guest'
    });

    mailOptions.attachments = [
      {
        filename: 'lagentry-demo.ics',
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        contentDisposition: 'attachment'
      }
    ];
  }

  return sendMailSafe(mailOptions);
}

/* =========================================================
   DEMO BOOKING - ADMIN EMAIL
========================================================= */

async function sendDemoAdminNotification(data) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Demo Booking</h2>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
        <p><strong>Company Size:</strong> ${data.companySize || 'N/A'}</p>
        <p><strong>Date & Time:</strong> ${data.bookingDate} ${data.bookingTime}</p>
        <p><strong>Agent of Interest:</strong> ${data.agentName || data.agentOfInterest || 'General'}</p>
        ${data.userRequirement || data.message ? `<p><strong>User Requirements:</strong> ${data.userRequirement || data.message}</p>` : ''}
      </div>
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
  const hero = `${getPublicBaseUrl()}/images/email/waitlist-hero.png`;

  const html = buildBrandedEmailTemplate({
    preheader: "You’re officially on the Lagentry waitlist.",
    eyebrow: "WAITLIST CONFIRMED",
    title: "You’re officially on the Lagentry waitlist ⭐",
    greeting: `Hi ${firstName(name)},`,
    highlightText: "Early access to AI employees for MENA just unlocked.",
    heroImageUrl: hero,
    bodyHtml: `
      <p style="margin:0 0 10px 0;">You’re in. Thanks for raising your hand early.</p>
      <p style="margin:0 0 10px 0;">We’re building <strong>real AI employees</strong> agents that don’t just chat, but actually work inside real teams — qualifying leads, answering support, and moving revenue.</p>
      <p style="margin:0 0 10px 0;">From here, you’ll get:
        <br />⭐ Early product previews and behind-the-scenes updates
        <br />⭐ First access when we open private beta
        <br />⭐ Practical examples of how other operators are using Lagentry
      </p>
      <p style="margin:0 0 10px 0;">If you want to share what you’re hoping to automate, just hit reply — I read these myself.</p>
      <p style="margin:0;">Glad you’re here. Really.</p>
    `,
    primaryCtaLabel: "View what Lagentry can do",
    primaryCtaUrl: `${getPublicBaseUrl()}/#how-it-works`,
    secondaryCtaLabel: "Book a live demo",
    secondaryCtaUrl: `${getPublicBaseUrl()}/book-demo`,
    footerNote:
      "No spam. Just sharp, operator-level updates on what’s actually working with AI in MENA.",
    accentColor: "#F97316",
  });

  return sendMailSafe({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
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
  const hero = `${getPublicBaseUrl()}/images/email/newsletter-hero.png`;

  const html = buildBrandedEmailTemplate({
    preheader: "Thanks for subscribing to sharp, no-fluff updates from Lagentry.",
    eyebrow: "NEWSLETTER",
    title: "Welcome to the Lagentry insider list 💌",
    greeting: `Hi ${firstName(name)},`,
    highlightText:
      "Short, practical emails on how AI employees are used in real businesses.",
    heroImageUrl: hero,
    bodyHtml: `
      <p style="margin:0 0 10px 0;">Thanks for subscribing.</p>
      <p style="margin:0 0 10px 0;">Every so often, I’ll send you:
        <br />⭐ Real breakdowns of how MENA teams are deploying Lagentry agents
        <br />⭐ What’s working (and what isn’t) as we build the platform
        <br />⭐ Product updates worth your attention — not every tiny tweak
      </p>
      <p style="margin:0 0 10px 0;">No fluffy “AI hype” content, no daily spam. Just the stuff an operator or founder actually needs to see.</p>
      <p style="margin:0;">If there’s a specific workflow you’re trying to automate, reply and tell me about it.</p>
    `,
    primaryCtaLabel: "See the latest on Lagentry",
    primaryCtaUrl: `${getPublicBaseUrl()}/#updates`,
    secondaryCtaLabel: "Book a 20‑minute demo",
    secondaryCtaUrl: `${getPublicBaseUrl()}/book-demo`,
    footerNote:
      "You can unsubscribe anytime from the link in the footer of any newsletter.",
    accentColor: "#A855F7",
  });

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
