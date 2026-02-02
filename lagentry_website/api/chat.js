// New lightweight chatbot endpoint: /api/chat
// Frontend Chat UI -> /api/chat -> OpenAI API (with knowledge base context)

const knowledgeBase = require('../data/knowledge-base.json');

// CORS helper (mirrors other Vercel API routes)
function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'https://lagentry.com',
    'https://www.lagentry.com',
    'https://aganret.com',
    'https://www.aganret.com',
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

const SYSTEM_PROMPT = `
You are Lagentry AI assistant.

You answer questions ONLY using the knowledge base provided to you.
If something is not in the knowledge base, clearly say you don't have that information
and gently guide users to contact the team or visit the website.

Your tone:
- Clear and confident
- Friendly and concise
- Helpful, not salesy

When relevant, you can:
- Mention that Lagentry is an AI Employee platform focused on UAE / MENA.
- Highlight multi-channel agents (web, WhatsApp, voice, email).
- Emphasize that Phase 1 AI employees include Customer Support, Real Estate, and HR.

Always prefer specific, high-signal answers over long, generic ones.
`;

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  // Preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, origin);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    setCORSHeaders(res, origin);

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LAGENTRY_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Chat is not configured yet. Missing OpenAI API key on the server.'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build context messages from short history, if provided
    const historyMessages = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content || '').slice(0, 2000)
          }))
      : [];

    const payload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT.trim()
        },
        {
          role: 'system',
          content: `Here is the Lagentry knowledge base as JSON. You must treat this as the source of truth:\n\n${JSON.stringify(
            knowledgeBase
          )}`
        },
        ...historyMessages,
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI API error:', response.status, text);
      throw new Error('Failed to generate response from model');
    }

    const json = await response.json();
    const reply =
      json?.choices?.[0]?.message?.content?.trim() ||
      "I'm here to answer questions about Lagentry based on the knowledge I have.";

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: 'Unexpected error while processing your message. Please try again.'
    });
  }
};

