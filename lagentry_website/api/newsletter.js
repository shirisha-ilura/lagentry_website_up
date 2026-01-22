const { sendNewsletterWelcomeEmail } = require('./_shared/emailService.js');

function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'https://lagentry.com',
    'https://www.lagentry.com',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, origin);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    setCORSHeaders(res, origin);

    const { email, name } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // ✅ MUST be awaited on Vercel
    await sendNewsletterWelcomeEmail({
      email: email.trim(),
      name: name?.trim() || '',
    });

    return res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      message: 'Failed to process newsletter signup',
    });
  }
};
