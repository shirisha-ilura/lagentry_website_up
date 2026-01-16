// Vercel serverless function to get all conversations for admin
const chatStorage = require('../_shared/chatStorage');

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

  if (req.method !== 'GET') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const conversations = chatStorage.getAllConversations();
    
    // Add handoff status and needs attention flag
    const conversationsWithStatus = conversations.map(conv => {
      const fullConv = chatStorage.conversations.get(conv.id);
      return {
        ...conv,
        handoff_status: fullConv?.handoff_status || 'bot',
        handoff_at: fullConv?.handoff_at || null,
        handoff_by: fullConv?.handoff_by || null,
        needs_attention: chatStorage.needsHumanAttention(conv.id),
      };
    });

    res.json({
      success: true,
      conversations: conversationsWithStatus.slice(0, 100),
    });
  } catch (error) {
    console.error('Error loading chats:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to load chats',
    });
  }
};

