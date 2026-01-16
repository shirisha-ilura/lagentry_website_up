// Vercel serverless function to release conversation back to bot
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

    // Vercel uses req.query for dynamic routes
    const conversationId = req.query.conversationId || req.query.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
      });
    }

    const conversation = chatStorage.releaseToBot(conversationId);
    
    // Add system message indicating bot is back
    chatStorage.addMessage(conversationId, 'system', 'The conversation has been returned to the AI assistant.');

    res.json({
      success: true,
      handoff_status: 'bot',
      conversation: conversation,
    });
  } catch (error) {
    console.error('Error releasing conversation:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to release conversation',
    });
  }
};

