// Vercel serverless function for starting voice calls with VAPI
// Note: Uses native fetch (Node.js 18+) - no need for node-fetch

// VAPI configuration from environment variables (set these in Vercel)
const VAPI_API_KEY = process.env.VAPI_API_KEY || 'f59d5ef2-204a-4b3a-9b99-2f2552a45a08';
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY || 'a40eb25c-29c0-44c6-a381-24d7587f572b';
const { upsertLead } = require('./_shared/leadsDb');

if (!process.env.VAPI_API_KEY || !process.env.VAPI_PUBLIC_KEY) {
  console.warn('⚠️ VAPI_API_KEY or VAPI_PUBLIC_KEY not set in environment variables. Using fallback values.');
}
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Fixed Assistant IDs (from your VAPI dashboard)
const FIXED_ASSISTANT_IDS = {
  'customer-support': 'f3532a03-0578-4077-82f2-19780af488f2', // Zara
  'lead-qualification': '492b6725-429d-4208-9e45-0d394d24b6c6', // Layla
  'real-estate': '9bf691cb-b73e-4e7e-ab2f-258c6468f5eb' // Ahmed
};

function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'https://lagentry.com',
    'https://www.lagentry.com',
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.FRONTEND_URL,
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

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, origin);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    setCORSHeaders(res, origin);

    // Parse request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }

    const { prompt, voiceId, userName, userEmail, userPhone, agentType } = body || {};

    if (!agentType) {
      console.error('Missing agentType in request:', body);
      return res.status(400).json({
        success: false,
        error: 'Agent type is required'
      });
    }

    console.log('Starting VAPI voice call for:', userName, 'Agent type:', agentType);

    // Use fixed assistant ID
    const agentId = FIXED_ASSISTANT_IDS[agentType];
    
    if (!agentId) {
      console.error(`No assistant ID found for agent type: ${agentType}`);
      return res.status(400).json({
        success: false,
        error: `No assistant ID configured for agent type: ${agentType}`
      });
    }

    console.log(`Using fixed assistant ID for ${agentType}:`, agentId);

    // Generate conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare variables for the agent
    const variables = {};
    if (userName && userName.trim()) {
      variables.customer_name = userName.trim();
    }

    // Save lead for lead qualification calls
    try {
      if (agentType === 'lead-qualification' && userEmail && typeof userEmail === 'string') {
        await upsertLead({
          email: userEmail.trim(),
          source: 'lead_qualification',
          name: userName?.trim() || null,
          phone: userPhone?.trim() || null,
          company: null,
          message: prompt?.trim() || null,
        });
      }
    } catch (dbErr) {
      console.error('❌ Failed to save lead_qualification lead to Postgres:', dbErr);
      // Do not fail the call if DB write fails
    }

    // Return response for WebRTC connection (frontend will use VAPI SDK)
    const response = {
      success: true,
      conversationId,
      agentId,
      message: 'Voice call initiated successfully',
      webRTCEnabled: true,
      publicApiKey: VAPI_PUBLIC_KEY,
      variables: variables
    };

    console.log('Returning success response:', JSON.stringify(response, null, 2));
    return res.json(response);

  } catch (error) {
    console.error('Error starting voice call:', error);
    console.error('Error stack:', error.stack);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: 'Failed to start voice call',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
