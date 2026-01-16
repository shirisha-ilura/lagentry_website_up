// Vercel serverless function for admin to reply to a conversation
const chatStorage = require('../../../_shared/chatStorage');

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
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    // Vercel dynamic routes: parameter name matches folder name
    const conversationId = req.query.conversationId;
    const { message, adminEmail } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Take over conversation if not already taken
    const conversation = chatStorage.getOrCreateConversation(conversationId);
    if (conversation.handoff_status === 'bot') {
      chatStorage.takeOver(conversationId, adminEmail || 'admin');
    }

    // Save admin message
    chatStorage.addMessage(conversationId, 'admin', message);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      handoff_status: 'human',
    });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply',
    });
  }
};

