// Vercel serverless function for demo booking
const { sendDemoConfirmationEmail, sendDemoInternalNotification } = require('./_shared/emailService');

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
    
    const { 
      name, 
      email, 
      phone, 
      company, 
      companySize, 
      agentOfInterest,
      message, 
      bookingDate, 
      bookingTime, 
      bookingDateTime 
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, date, and time are required'
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

    // Send confirmation emails (non-blocking)
    sendDemoConfirmationEmail({
      email: email.trim(),
      name: name.trim(),
      dateTime: bookingDateTime || `${bookingDate} at ${bookingTime}`,
      meetingLink: null,
      agentName: agentOfInterest || 'General Demo',
      userRequirement: message || '',
      rescheduleLink: null,
      cancelLink: null
    }).catch(err => {
      console.error('Failed to send demo confirmation email:', err);
    });

    sendDemoInternalNotification({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      company: company || '',
      dateTime: bookingDateTime || `${bookingDate} at ${bookingTime}`,
      agentName: agentOfInterest || 'General Demo',
      userRequirement: message || ''
    }).catch(err => {
      console.error('Failed to send internal notification email:', err);
    });

    res.json({
      success: true,
      message: 'Demo booked successfully!'
    });
  } catch (error) {
    console.error('Error processing demo booking:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to book demo'
    });
  }
};

