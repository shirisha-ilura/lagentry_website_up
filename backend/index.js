// Express backend for storing contact messages in Supabase and handling voice calls
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - allow requests from frontend
// In production, allow requests from Netlify domains and custom domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  // Add your Netlify domain(s) here
  'https://blacklagentrywebsite.netlify.app',
  'https://lagentry.com',
  'https://www.lagentry.com',
  // Allow all Netlify preview deployments
  /^https:\/\/.*\.netlify\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json());

// Supabase configuration
// Try to read from environment, otherwise fall back to your known project values
const supabaseUrl =
  process.env.SUPABASE_URL || 'https://zlcijmyouoasydkamyeb.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  // Fallback anon key so the server still starts even if .env is misconfigured
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsY2lqbXlvdW9hc3lka2FteWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMzMjMsImV4cCI6MjA3OTU1OTMyM30.pmY5VTVDvmfKLepR3B7YMtpaszGo2gGdMsoopnPbGVY';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️  Supabase credentials are not fully configured for the backend.\n' +
      'Using hard-coded fallback URL/key. For production, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// VAPI configuration
const VAPI_API_KEY = 'f59d5ef2-204a-4b3a-9b99-2f2552a45a08'; // Private key for server-side
const VAPI_PUBLIC_KEY = 'a40eb25c-29c0-44c6-a381-24d7587f572b'; // Public key for client-side
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Simplified agent prompts (using key parts from the full server)
const LEAD_QUALIFICATION_PROMPT = `You are Layla, Lagentry's Lead Qualification AI Agent. Always use the user's name when addressing them. Your job: convert website visitors into qualified leads by explaining Lagentry's value. Lagentry is the MENA's first full AI-Employee Platform - a unified place where businesses can hire/deploy/use & create real, working AI agents. It replaces multiple expensive tools in ONE platform for only $20 per month. Be warm, confident, consultative, never robotic.`;

const CUSTOMER_SUPPORT_PROMPT = `You are Zara, Lagentry's Customer Support AI Agent. Always use the user's name when addressing them. Help users with support questions, resolve issues, collect information, create tickets, handle demo bookings. Be helpful, confident, friendly, and human - never robotic.`;

const REAL_ESTATE_PROMPT = `You are Ahmed, ACME Corp's Real Estate AI Agent. Always use the user's name when addressing them. Help buyers, tenants, and investors with inventory, unit availability, pricing, viewing bookings. Sound like a real human real-estate consultant - warm, knowledgeable, helpful. Never robotic.`;

// Agent configurations
const AGENT_CONFIGS = {
  'lead-qualification': {
    name: 'Layla - Lead Qualification',
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    model: 'gpt-4o-mini',
    firstMessage: 'Hey, I\'m Layla from Lagentry. What are you exploring today?',
    systemPrompt: LEAD_QUALIFICATION_PROMPT
  },
  'customer-support': {
    name: 'Zara - Customer Support',
    voiceId: 'jqcCZkN6Knx8BJ5TBdYR',
    model: 'gpt-4o-mini',
    firstMessage: 'Hey, I\'m Zara from Lagentry. How can I assist you today?',
    systemPrompt: CUSTOMER_SUPPORT_PROMPT
  },
  'real-estate': {
    name: 'Ahmed - Real Estate',
    voiceId: '1SM7GgM6IMuvQlz2BwM3',
    model: 'gpt-4o-mini',
    firstMessage: 'Hey, I am Ahmed from ACME Corp. How can I help you today?',
    systemPrompt: REAL_ESTATE_PROMPT
  }
};

// Store active conversations
const activeConversations = new Map();

// Fixed Assistant IDs - Use these instead of creating new assistants
const FIXED_ASSISTANT_IDS = {
  'customer-support': 'f3532a03-0578-4077-82f2-19780af488f2', // Zara
  'lead-qualification': '492b6725-429d-4208-9e45-0d394d24b6c6', // Layla
  'real-estate': '9bf691cb-b73e-4e7e-ab2f-258c6468f5eb' // Ahmed
};

// Function to create VAPI agent
async function createVAPIAgent(agentType, userName = null) {
  try {
    const config = AGENT_CONFIGS[agentType];
    if (!config) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Personalize first message with user's name if provided
    let personalizedFirstMessage = config.firstMessage;
    if (userName && userName.trim()) {
      if (agentType === 'lead-qualification') {
        personalizedFirstMessage = `Hey ${userName}, I'm Layla from Lagentry. What are you exploring today?`;
      } else if (agentType === 'customer-support') {
        personalizedFirstMessage = `Hey ${userName}, I'm Zara from Lagentry. How can I assist you today?`;
      } else if (agentType === 'real-estate') {
        personalizedFirstMessage = `Hey ${userName}, I am Ahmed from ACME Corp. How can I help you today?`;
      }
    }

    const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name,
        model: {
          provider: 'openai',
          model: config.model,
          messages: [
            {
              role: 'system',
              content: config.systemPrompt
            }
          ]
        },
        voice: {
          provider: '11labs',
          voiceId: config.voiceId
        },
        firstMessage: personalizedFirstMessage,
        firstMessageMode: 'assistant-speaks-first',
        voicemailDetectionEnabled: false,
        recordingEnabled: false,
        customerJoinTimeoutSeconds: 30,
        silenceTimeoutSeconds: 60,
        maxDurationSeconds: 60
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`VAPI API error for ${agentType}:`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error creating VAPI agent for ${agentType}:`, error);
    return null;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Store contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save contact message',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Contact message saved successfully',
      data,
    });
  } catch (err) {
    console.error('Unexpected error in /api/contact:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error',
    });
  }
});

// Start voice call endpoint using VAPI
app.post('/api/start-voice-call', async (req, res) => {
  try {
    const { prompt, voiceId, userName, userEmail, userPhone, agentType } = req.body;

    console.log('Starting VAPI voice call for:', userName, 'Agent type:', agentType);

    const agentConfig = AGENT_CONFIGS[agentType];
    if (!agentConfig) {
      return res.status(400).json({
        success: false,
        error: 'Invalid agent type'
      });
    }

    // Use fixed assistant IDs instead of creating new assistants
    const agentId = FIXED_ASSISTANT_IDS[agentType];
    
    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: `No fixed assistant ID configured for agent type: ${agentType}`
      });
    }

    console.log(`Using fixed assistant ID for ${agentType}:`, agentId);
    
    // If userName is provided, we'll pass it as {{customer_name}} to the agent
    // The agent prompt should handle this variable
    if (userName && userName.trim()) {
      console.log(`User name ${userName} will be sent as {{customer_name}} to agent prompt`);
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store conversation data
    activeConversations.set(conversationId, {
      agentId,
      agentType,
      userName,
      userEmail,
      userPhone,
      startTime: new Date(),
      prompt
    });

    // Prepare variables to pass to the agent (customer_name will be available as {{customer_name}} in the prompt)
    const variables = {};
    if (userName && userName.trim()) {
      variables.customer_name = userName.trim();
    }

    res.json({
      success: true,
      conversationId,
      agentId,
      message: 'Voice call initiated successfully',
      webRTCEnabled: true,
      publicApiKey: VAPI_PUBLIC_KEY,
      // Pass customer name as variable for the agent prompt
      variables: variables
    });

  } catch (error) {
    console.error('Error starting voice call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start voice call',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
  console.log(`Voice call API available at http://localhost:${PORT}/api/start-voice-call`);
});


