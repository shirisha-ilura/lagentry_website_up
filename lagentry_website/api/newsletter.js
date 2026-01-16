// Vercel serverless function for newsletter signup
const { sendNewsletterWelcomeEmail } = require('./_shared/emailService');

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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { email, name } = req.body;

    // Validate input
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Send newsletter welcome email (non-blocking)
    sendNewsletterWelcomeEmail({
      email: email.trim(),
      name: name?.trim() || ''
    }).catch(err => {
      console.error('Failed to send newsletter welcome email:', err);
    });

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to process newsletter signup'
    });
  }
};

