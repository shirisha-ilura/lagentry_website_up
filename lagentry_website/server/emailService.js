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

// Debug: Log email configuration status (without exposing passwords)
console.log('📧 Email Configuration Status:');
console.log('  EMAIL_HOST:', EMAIL_HOST);
console.log('  EMAIL_PORT:', EMAIL_PORT);
console.log('  EMAIL_USE_TLS:', EMAIL_USE_TLS);
console.log('  EMAIL_USER:', EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}***` : 'NOT SET');
console.log('  EMAIL_PASS:', EMAIL_PASS ? '***SET***' : 'NOT SET');
console.log('  EMAIL_FROM:', EMAIL_FROM);
console.log('  COMPANY_EMAIL:', COMPANY_EMAIL);

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('❌ Email credentials not configured. Emails will not be sent.');
      console.error('Please add these to your server/.env file:');
      console.error('  EMAIL_USER=your-email@gmail.com');
      console.error('  EMAIL_PASSWORD=your-gmail-app-password');
      console.error('  EMAIL_FROM=info@lagentry.com');
      console.error('  EMAIL_FROM_NAME=Zoya – Founder, Lagentry');
      console.error('  COMPANY_EMAIL=info@lagentry.com');
      console.error('');
      console.error('For Gmail: Enable 2FA and generate an App Password at:');
      console.error('https://myaccount.google.com/apppasswords');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      requireTLS: EMAIL_USE_TLS || EMAIL_PORT === 587, // Use TLS for port 587 or if explicitly set
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs
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

// Helper function to format date and time
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'Date TBD';
  
  try {
    let date;
    
    // Handle different date formats
    if (typeof dateTimeString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateTimeString);
      
      // If invalid, try other formats
      if (isNaN(date.getTime())) {
        // Try parsing as date + time separately
        const parts = dateTimeString.split('T');
        if (parts.length > 1) {
          date = new Date(dateTimeString);
        }
      }
    } else if (dateTimeString instanceof Date) {
      date = dateTimeString;
    } else {
      date = new Date(dateTimeString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided:', dateTimeString);
      return 'Date TBD';
    }
    
    // Format the date
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
    console.error('Error formatting date:', error, dateTimeString);
    return 'Date TBD';
  }
}

// Helper to get a safe base URL for assets/links inside emails
function getPublicBaseUrl() {
  // Prefer explicit frontend URL if set
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, '');
  }
  // Fall back to a generic production domain
  return 'https://lagentry.com';
}

/**
 * Shared HTML email layout (inspired by modern ecommerce emails).
 * Uses inline styles and table layout for better email-client support.
 */
function buildBrandedEmailTemplate({
  preheader = '',
  eyebrow = '',
  title = '',
  greeting = '',
  bodyHtml = '',
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  highlightText,
  heroImageUrl,
  footerNote,
  accentColor = '#F97316', // warm orange
}) {
  const baseUrl = getPublicBaseUrl();
  const safeHero = heroImageUrl || `${baseUrl}/images/email/lagentry-hero-default.png`;

  // Preheader is hidden in most clients but appears in inbox preview
  const safePreheader = (preheader || title || '').replace(/"/g, "'");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || 'Lagentry'}</title>
    <style>
      /* Some clients support embedded styles; critical styles are also inlined */
      @media only screen and (max-width: 600px) {
        .wrapper {
          width: 100% !important;
        }
        .card {
          padding: 24px 18px !important;
        }
        .hero-title {
          font-size: 24px !important;
          line-height: 1.2 !important;
        }
        .cta-primary, .cta-secondary {
          display: block !important;
          width: 100% !important;
          margin: 0 0 12px 0 !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#020617; background-image:radial-gradient(circle at top, rgba(248,250,252,0.06), transparent 55%), radial-gradient(circle at bottom, rgba(79,70,229,0.18), transparent 60%); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <!-- Preheader text : hidden -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; visibility:hidden; mso-hide:all;">
      ${safePreheader}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:transparent; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrapper" style="width:600px; max-width:100%;">
            <!-- Brand header -->
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
                      <!-- Thin accent bar inspired by modern SaaS emails -->
                      <div style="height:3px; width:100%; border-radius:999px; background:linear-gradient(90deg, ${accentColor}, #22c55e, #0ea5e9);"></div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="padding:0 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius:24px; overflow:hidden; background:radial-gradient(circle at top left, rgba(248,250,252,0.08), transparent 55%), radial-gradient(circle at bottom right, rgba(148,163,184,0.16), transparent 60%), #020617; border:1px solid rgba(148,163,184,0.35);" class="card">
                  <!-- Hero image -->
                  <tr>
                    <td align="center" style="padding:0; border-bottom:1px solid rgba(148,163,184,0.16);">
                      <img src="${safeHero}" width="600" alt="Lagentry AI agents" style="display:block; width:100%; max-width:600px; height:auto; border:0; outline:none; text-decoration:none;" />
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding:28px 28px 10px 28px;">
                      ${eyebrow ? `<div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:${accentColor}; margin-bottom:8px;">${eyebrow}</div>` : ''}
                      <div class="hero-title" style="font-size:28px; line-height:1.25; font-weight:700; color:#F9FAFB; margin:0 0 12px 0;">
                        ${title}
                      </div>
                      ${highlightText ? `
                        <div style="margin:0 0 14px 0; font-size:13px; color:#E5E7EB;">
                          <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:rgba(15,23,42,0.9); border:1px solid rgba(148,163,184,0.45); font-size:12px;">
                            ⭐ ${highlightText}
                          </span>
                        </div>
                      ` : ''}
                      ${greeting ? `<p style="margin:0 0 10px 0; font-size:14px; line-height:1.6; color:#E5E7EB;">${greeting}</p>` : ''}
                      <div style="font-size:14px; line-height:1.7; color:#E5E7EB; margin:0 0 4px 0;">
                        ${bodyHtml}
                      </div>
                    </td>
                  </tr>

                  <!-- CTAs -->
                  ${(primaryCtaLabel && primaryCtaUrl) || (secondaryCtaLabel && secondaryCtaUrl) ? `
                  <tr>
                    <td align="center" style="padding:4px 28px 24px 28px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          ${primaryCtaLabel && primaryCtaUrl ? `
                          <td align="center" style="padding:0 6px 8px 0;">
                            <a href="${primaryCtaUrl}" class="cta-primary" style="background-color:${accentColor}; color:#0B1020 !important; text-decoration:none; padding:11px 22px; border-radius:999px; font-size:13px; font-weight:600; display:inline-block; border:none;">
                              ✨ ${primaryCtaLabel}
                            </a>
                          </td>` : ''}
                          ${secondaryCtaLabel && secondaryCtaUrl ? `
                          <td align="center" style="padding:0 0 8px 6px;">
                            <a href="${secondaryCtaUrl}" class="cta-secondary" style="background-color:transparent; color:#E5E7EB !important; text-decoration:none; padding:10px 18px; border-radius:999px; font-size:13px; font-weight:500; display:inline-block; border:1px solid rgba(148,163,184,0.55);">
                              ${secondaryCtaLabel}
                            </a>
                          </td>` : ''}
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Footer inside card -->
                  <tr>
                    <td style="padding:0 28px 26px 28px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:11px; color:#9CA3AF; line-height:1.6;">
                            <div style="margin-bottom:6px;">
                              <strong style="color:#E5E7EB;">Zoya</strong><br />
                              CEO, Lagentry
                            </div>
                            ${footerNote ? `<div>${footerNote}</div>` : ''}
                          </td>
                          <td align="right" style="font-size:11px; color:#6B7280;">
                            <div style="margin-bottom:4px;">⭐ Built for operators, not hobbyists.</div>
                            <div>Follow along at <a href="${baseUrl}" style="color:#A855F7; text-decoration:none;">lagentry.com</a></div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Legal footer -->
            <tr>
              <td align="center" style="padding:18px 16px 8px 16px;">
                <div style="font-size:10px; line-height:1.5; color:#6B7280; max-width:520px; margin:0 auto;">
                  You’re receiving this email because you interacted with Lagentry (waitlist, demo booking, or newsletter). 
                  If this wasn’t you, you can safely ignore this message.
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

/**
 * 1. Waitlist Confirmation Email
 */
async function sendWaitlistConfirmationEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping waitlist email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const waitlistHero =
    process.env.EMAIL_WAITLIST_HERO_URL ||
    `${getPublicBaseUrl()}/images/email/waitlist-hero.png`;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "You're officially in! Welcome to Lagentry 🚀",
    html: buildBrandedEmailTemplate({
      preheader: "You’re officially on the Lagentry waitlist.",
      eyebrow: "WAITLIST CONFIRMED",
      title: "You’re officially on the Lagentry waitlist ⭐",
      greeting: `Hi ${firstName || 'there'},`,
      highlightText: "Early access to AI employees for MENA just unlocked.",
      heroImageUrl: waitlistHero,
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
      footerNote: "No spam. Just sharp, operator-level updates on what’s actually working with AI in MENA.",
      accentColor: "#F97316"
    }),
    text: `
Hi ${firstName || 'there'},

You're officially on the Lagentry waitlist!

I'm Zoya, CEO of Lagentry, and I wanted to personally say hello.

We're building what we like to call "AI employees" agents that don't just chat, but actually work inside real businesses across MENA.

You'll hear from us as we open early access, roll out features, and get closer to launch. No noise. No spam. Just real updates.

If you ever want to share what you're hoping to automate, just reply! I read these myself.

Glad you're here. Really.

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send waitlist confirmation email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    console.log('   Subject:', mailOptions.subject);
    console.log('   First Name:', firstName || 'N/A');
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Waitlist confirmation email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending waitlist confirmation email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    if (error.responseCode) {
      console.error('   Response Code:', error.responseCode);
    }
    if (error.command) {
      console.error('   Failed Command:', error.command);
    }
    console.error('   Full error object:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * 2. Newsletter Signup Email
 */
async function sendNewsletterWelcomeEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping newsletter email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const newsletterHero =
    process.env.EMAIL_NEWSLETTER_HERO_URL ||
    `${getPublicBaseUrl()}/images/email/newsletter-hero.png`;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Welcome to Lagentry! Let's build this right",
    html: buildBrandedEmailTemplate({
      preheader: "Thanks for subscribing to sharp, no-fluff updates from Lagentry.",
      eyebrow: "NEWSLETTER",
      title: "Welcome to the Lagentry insider list 💌",
      greeting: `Hi ${firstName || 'there'},`,
      highlightText: "Short, practical emails on how AI employees are used in real businesses.",
      heroImageUrl: newsletterHero,
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
      footerNote: "You can unsubscribe anytime from the link in the footer of any newsletter.",
      accentColor: "#A855F7"
    }),
    text: `
Hi ${firstName || 'there'},

Welcome to Lagentry!

From time to time, I'll share how we're building "AI employees" for real businesses in MENA what's working, what isn't, and what's coming next.

This won't be marketing fluff.

Just honest updates from the ground.

Thanks for joining us.

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send newsletter welcome email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Newsletter welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending newsletter welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Demo Booked - User Confirmation Email
 */
async function sendDemoConfirmationEmail({ email, name, dateTime, meetingLink, agentName, userRequirement, rescheduleLink, cancelLink }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping demo confirmation email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const formattedDateTime = formatDateTime(dateTime);
  
  // Parse dateTime to get start and end dates for calendar invite
  let startDate, endDate;
  try {
    if (dateTime instanceof Date) {
      startDate = new Date(dateTime);
    } else if (typeof dateTime === 'string') {
      startDate = new Date(dateTime);
    } else {
      startDate = new Date(dateTime);
    }
    
    if (isNaN(startDate.getTime())) {
      console.warn('⚠️ Invalid dateTime provided for calendar invite:', dateTime);
      startDate = null;
      endDate = null;
    } else {
      // Set end date to 1 hour after start
      endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      console.log('📅 Parsed dates for calendar invite:', {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        originalDateTime: dateTime
      });
    }
  } catch (error) {
    console.error('❌ Error parsing dateTime for calendar invite:', error);
    startDate = null;
    endDate = null;
  }
  
  // Use provided reschedule and cancel links, or generate them if not provided
  let finalRescheduleLink = rescheduleLink;
  let finalCancelLink = cancelLink;
  
  // Only generate links if they weren't provided
  if (!finalRescheduleLink || !finalCancelLink) {
    let backendUrl = process.env.BACKEND_URL || process.env.SERVER_URL;
    if (!backendUrl) {
      // Try to use Vercel URL if available
      if (process.env.VERCEL_URL) {
        // Vercel deployment - use the VERCEL_URL environment variable
        backendUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.VERCEL) {
        // Vercel deployment - use the default backend URL
        backendUrl = 'https://lagentry-backend.vercel.app';
      } else {
        // Fallback to production URL, never use localhost
        backendUrl = process.env.FRONTEND_URL || 'https://lagentry.com';
      }
    }
    finalRescheduleLink = finalRescheduleLink || `${backendUrl}/reschedule-demo?email=${encodeURIComponent(email)}`;
    finalCancelLink = finalCancelLink || `${backendUrl}/cancel-demo?email=${encodeURIComponent(email)}`;
  }
  
  // Debug: Log the links being used
  console.log('🔗 Reschedule/Cancel Links:', {
    finalRescheduleLink: finalRescheduleLink,
    finalCancelLink: finalCancelLink,
    providedRescheduleLink: rescheduleLink,
    providedCancelLink: cancelLink,
    usingProvidedLinks: !!(rescheduleLink && cancelLink)
  });

  // Generate calendar invite attachment if we have valid dates
  const attachments = [];
  if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    try {
      const icalContent = generateICalInvite({
        title: 'Lagentry Demo',
        description: `Demo session with Lagentry. ${agentName ? `Agent of Interest: ${agentName}.` : ''} ${userRequirement ? `Notes: ${userRequirement}` : ''} Meeting Link: ${meetingLink || 'TBD'}`,
        location: 'Online',
        start: startDate,
        end: endDate,
        organizerEmail: EMAIL_FROM,
        organizerName: EMAIL_FROM_NAME,
        attendeeEmail: email,
        attendeeName: name || firstName || 'Guest'
      });
      
      attachments.push({
        filename: 'lagentry-demo.ics',
        content: icalContent,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        contentDisposition: 'attachment'
      });
      
      console.log('✅ Calendar invite generated and attached to email');
      console.log('   Filename: lagentry-demo.ics');
      console.log('   Content length:', icalContent.length, 'bytes');
    } catch (error) {
      console.error('❌ Error generating calendar invite:', error);
      console.error('   Error stack:', error.stack);
      // Continue without calendar invite if generation fails
    }
  } else {
    console.warn('⚠️ Cannot generate calendar invite: invalid or missing date/time');
    console.warn('   startDate:', startDate);
    console.warn('   endDate:', endDate);
    console.warn('   dateTime provided:', dateTime);
  }

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Your Lagentry demo is booked! Let's automate your business!",
    attachments: attachments.length > 0 ? attachments : [],
    html: buildBrandedEmailTemplate({
      preheader: "Your Lagentry demo is confirmed. Calendar invite is attached.",
      eyebrow: "DEMO CONFIRMED",
      title: "Your Lagentry demo is locked in ✅",
      greeting: `Hi ${name || firstName || 'there'},`,
      highlightText: formattedDateTime ? `You’re meeting with us on ${formattedDateTime}.` : "Your demo is scheduled and ready.",
      heroImageUrl:
        process.env.EMAIL_DEMO_HERO_URL ||
        `${getPublicBaseUrl()}/images/email/demo-hero.png`,
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
      primaryCtaUrl: finalRescheduleLink,
      secondaryCtaLabel: "❌ Cancel demo",
      secondaryCtaUrl: finalCancelLink,
      footerNote: "If these links don’t work for any reason, just reply to this email and we’ll adjust your booking manually.",
      accentColor: "#8B5CF6"
    }),
    text: `
Hi ${name || firstName || 'there'},

Your Lagentry demo is confirmed!

In the session, I'll walk you through how Lagentry agents work in real production environments beyond demos and buzzwords.

You'll find the meeting details in your calendar invite.

You can reschedule or cancel anytime if needed.

Reschedule your demo: ${finalRescheduleLink}
Cancel your demo: ${finalCancelLink}

Looking forward to speaking with you!

Zoya
CEO, Lagentry
    `.trim()
  };

  try {
    console.log('📧 Preparing to send demo confirmation email...');
    console.log('   To:', email);
    console.log('   BCC:', COMPANY_EMAIL);
    console.log('   From:', EMAIL_FROM);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo confirmation email sent to user:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3b. Demo Booked - Internal Team Notification Email
 */
async function sendDemoInternalNotification({ name, email, phone, company, companySize, dateTime, meetingLink, agentName, userRequirement }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping internal notification email.');
    return { success: false, error: 'Email not configured' };
  }

  const formattedDateTime = formatDateTime(dateTime);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: COMPANY_EMAIL,
    replyTo: email, // Reply-to set to user's email
    subject: `New Demo Booking: ${name} - ${formattedDateTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Demo Booking</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Company Size:</strong> ${companySize || 'N/A'}</p>
          <p><strong>Date & Time:</strong> ${formattedDateTime || dateTime}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink || '#'}">${meetingLink || 'TBD'}</a></p>
          <p><strong>Agent of Interest:</strong> ${agentName || 'General'}</p>
          ${userRequirement ? `<p><strong>User Requirements:</strong> ${userRequirement}</p>` : ''}
        </div>
      </div>
    `,
    text: `
New Demo Booking

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Company: ${company || 'N/A'}
Company Size: ${companySize || 'N/A'}
Date & Time: ${formattedDateTime || dateTime}
Meeting Link: ${meetingLink || 'TBD'}
Agent of Interest: ${agentName || 'General'}
${userRequirement ? `User Requirements: ${userRequirement}` : ''}
    `.trim()
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

/**
 * 4. Demo Rescheduled Email
 */
async function sendDemoRescheduledEmail({ email, name, dateTime, meetingLink }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping reschedule email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const formattedDateTime = formatDateTime(dateTime);

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Your Lagentry Demo Has Been Rescheduled 🔄",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>Your demo has been successfully rescheduled.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>New Date & Time:</strong> ${formattedDateTime || 'Date TBD'}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink || '#'}" style="color: #0066cc; text-decoration: none;">${meetingLink || 'TBD'}</a></p>
        </div>
        
        <p>Looking forward to it.</p>
        
        <p>— Zoya</p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

Your demo has been successfully rescheduled.

New Date & Time: ${formattedDateTime || 'Date TBD'}
Meeting Link: ${meetingLink || 'TBD'}

Looking forward to it.

— Zoya
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo rescheduled email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo rescheduled email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Demo Cancelled Email
 */
async function sendDemoCancelledEmail({ email, name }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping cancellation email.');
    return { success: false, error: 'Email not configured' };
  }

  const firstName = getFirstName(name);
  const baseUrl = process.env.FRONTEND_URL || 'https://lagentry.com' || 'http://localhost:3000';
  const bookAgainLink = `${baseUrl}/book-demo`;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: email,
    bcc: COMPANY_EMAIL, // BCC company email so it appears in sent box
    replyTo: EMAIL_FROM,
    subject: "Demo Cancelled – Hope to See You Again",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi ${firstName || 'there'},</p>
        
        <p>I noticed you cancelled your demo — no worries at all.</p>
        
        <p>If you ever want to reconnect, feel free to reach us at ${COMPANY_EMAIL} or simply <a href="${bookAgainLink}" style="color: #0066cc; text-decoration: none;">book again</a> when the time feels right.</p>
        
        <p>Wishing you the best,</p>
        
        <p><strong>Zoya</strong></p>
      </div>
    `,
    text: `
Hi ${firstName || 'there'},

I noticed you cancelled your demo — no worries at all.

If you ever want to reconnect, feel free to reach us at ${COMPANY_EMAIL} or simply book again when the time feels right.

Wishing you the best,

Zoya
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Demo cancelled email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending demo cancelled email:', error);
    return { success: false, error: error.message };
  }
}

// Send chat notification email to admin
async function sendChatNotificationEmail({ conversationId, userMessage, timestamp }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured. Chat notification email not sent.');
    return { success: false, error: 'Email not configured' };
  }

  const adminEmail = COMPANY_EMAIL;
  const chatUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/chats`
    : `http://localhost:3000/admin/chats`;

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
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          You can reply directly from the admin panel. The bot will stop responding once you take over.
        </p>
      </div>
    `,
    text: `
New Chat Conversation

A new conversation has started on the Lagentry website chatbot.

User Message: ${userMessage}

Conversation ID: ${conversationId}
Time: ${new Date(timestamp).toLocaleString()}

View & Reply: ${chatUrl}

You can reply directly from the admin panel. The bot will stop responding once you take over.
    `.trim()
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
  sendDemoRescheduledEmail,
  sendDemoCancelledEmail,
  sendChatNotificationEmail,
  getTransporter
};

