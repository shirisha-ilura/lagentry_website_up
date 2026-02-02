// Unified admin chat handler - handles GET, POST (reply, takeover, release)
const chatStorage = require('../../_shared/chatStorage');

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

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    // Vercel uses req.query for dynamic routes
    const conversationId = req.query.conversationId || req.query.id;
    const action = req.query.action || req.body?.action; // reply, takeover, release

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required',
      });
    }

    // Route based on method and action
    if (req.method === 'GET') {
      // Get conversation
      const conversation = chatStorage.getOrCreateConversation(conversationId);
      const messages = chatStorage.getMessages(conversationId);

      return res.json({
        success: true,
        conversation: {
          id: conversation.id,
          status: conversation.status,
          handoff_status: conversation.handoff_status,
          handoff_at: conversation.handoff_at,
          handoff_by: conversation.handoff_by,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          messageCount: messages.length,
        },
        messages: messages,
      });
    } else if (req.method === 'POST') {
      // Handle POST actions: reply, takeover, release
      if (action === 'reply') {
        return await handleReply(req, res, conversationId);
      } else if (action === 'takeover') {
        return await handleTakeover(req, res, conversationId);
      } else if (action === 'release') {
        return await handleRelease(req, res, conversationId);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use ?action=reply, ?action=takeover, or ?action=release',
        });
      }
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('Admin chat API error:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: 'Failed to process request',
    });
  }
};

// Handle admin reply
async function handleReply(req, res, conversationId) {
  const { message, adminName } = 'Admin' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message is required',
    });
  }

  const adminMessage = {
    id: `admin-${Date.now()}`,
    role: 'admin',
    content: message.trim(),
    timestamp: new Date().toISOString(),
    adminName,
  };

  chatStorage.addMessage(conversationId, 'admin', message.trim(), adminName);
  const conversation = chatStorage.getOrCreateConversation(conversationId);

  return res.json({
    success: true,
    message: adminMessage,
    conversation: {
      id: conversation.id,
      status: conversation.status,
      handoff_status: conversation.handoff_status,
    },
  });
}

// Handle takeover
async function handleTakeover(req, res, conversationId) {
  const { adminName = 'Admin' } = req.body;

  const conversation = chatStorage.getOrCreateConversation(conversationId);
  conversation.handoff_status = 'human';
  conversation.handoff_at = new Date().toISOString();
  conversation.handoff_by = adminName;
  conversation.status = 'active';

  chatStorage.addMessage(
    conversationId,
    'system',
    `${adminName} has taken over this conversation.`
  );

  return res.json({
    success: true,
    conversation: {
      id: conversation.id,
      status: conversation.status,
      handoff_status: conversation.handoff_status,
      handoff_at: conversation.handoff_at,
      handoff_by: conversation.handoff_by,
    },
  });
}

// Handle release
async function handleRelease(req, res, conversationId) {
  const conversation = chatStorage.getOrCreateConversation(conversationId);
  conversation.handoff_status = 'bot';
  conversation.handoff_at = null;
  conversation.handoff_by = null;

  chatStorage.addMessage(
    conversationId,
    'system',
    'Conversation has been released back to the bot.'
  );

  return res.json({
    success: true,
    conversation: {
      id: conversation.id,
      status: conversation.status,
      handoff_status: conversation.handoff_status,
    },
  });
}