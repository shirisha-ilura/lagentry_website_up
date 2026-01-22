// Vercel serverless function for waitlist signup
const { sendWaitlistConfirmationEmail } = require('./_shared/emailService');

// CORS headers
function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'https://lagentry.com',
    'https://www.lagentry.com',
    'https://aganret.com',
    'https://www.aganret.com',
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Timeout wrapper to avoid long hangs
function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email timeout")), ms)
    ),
  ]);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { email, name } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // ✅ IMPORTANT FIX: Await email safely with timeout
    try {
      await withTimeout(
        sendWaitlistConfirmationEmail({
          email: email.trim(),
          name: name?.trim() || ''
        }),
        4000 // max wait 4 seconds
      );
    } catch (mailErr) {
      console.error("Email sending issue:", mailErr.message);
      // Do NOT fail the user if mail is slow/fails
    }

    return res.json({
      success: true,
      message: "You've successfully joined the Lagentry waitlist! Stay tuned for updates."
    });

  } catch (error) {
    console.error('Error processing waitlist form:', error);
    setCORSHeaders(res, req.headers.origin);
    return res.status(500).json({
      success: false,
      message: 'Failed to process waitlist submission'
    });
  }
};
