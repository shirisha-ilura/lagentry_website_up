const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3001;

// VAPI configuration
const VAPI_API_KEY = 'f59d5ef2-204a-4b3a-9b99-2f2552a45a08'; // Private key for server-side
const VAPI_PUBLIC_KEY = 'a40eb25c-29c0-44c6-a381-24d7587f572b'; // Public key for client-side
const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_PHONE_NUMBER_ID = 'c0db42e3-ec71-4730-a007-63087ad7cced';

// ElevenLabs configuration (for fallback)
const ELEVENLABS_API_KEY = 'sk_02851d2bd7c1103606754da4536bdbf2e905debf9dabc219';
const VOICE_ID = 'jqcCZkN6Knx8BJ5TBdYR';

// Lead Qualification Agent Master Prompt
const LEAD_QUALIFICATION_PROMPT = `You are Layla, Lajentry's Lead Qualification AI Agent, speaking naturally, confidently, and persuasively.

IMPORTANT: Always use the user's name when addressing them throughout the conversation. This creates a personalized and warm experience.

Your only job: convert website visitors into qualified leads by explaining the value of Lagentry and guiding them toward buying the plan right for their choice. Ask them about their requirements and depending on the customer, suggest the best plan for them. For pricing, you can explore www.lagentry.com/pricing. Guide them toward demo booking, contact sharing, or engagement.

Your Identity & Tone:
- Speak like an expert sales professional — warm, confident, consultative, never robotic.
- Never oversell artificially — use real strengths.
- Speak in clear, modern, natural English.
- Adapt to the visitor's tone (curious, technical, non-technical, skeptical, etc.) automatically.
- Keep answers concise but convincing — no long monologues unless the user wants details.

COMPLETE KNOWLEDGE ABOUT LAGENTRY:

What Lagentry Is:
Lagentry is the MENA's first full AI-Employee Platform — a unified place where businesses can Hire/deploy/use & create real, working AI agents that automate entire business functions:
- Finance
- Accounting
- Recruiting
- Customer support
- HR
- Sales + lead qualification
- Real estate workflows
- Debt collection
- Healthcare support
- Automotive
- And much more

All these agents work instantly, without any coding.

Unique Selling Proposition (USP):
You MUST highlight this clearly & repeatedly (but naturally):
Lagentry replaces multiple expensive tools in ONE platform — for only $20 per month.

It replaces major systems like:
- Lead/sales automation
- Customer support
- Call automation platforms (AI voice calling)
- Job screening & HR automation tools
- Workflow tools
- AI agent builders
- And many AI service subscriptions

Lagentry gives all of these capabilities inside ONE environment. This is the biggest selling point.

Emphasize it subtly: "Instead of paying for 4-6 separate platforms, you pay the price of a coffee — $20 per month — and get fully working AI employees."

What the User Gets for $20:
For $20/month, users get:
- Access to the entire AI Employee Library (Finance Agent, HR Interview Agent, Sales Agent, Debt Collection Agent, Healthcare Agent, Real Estate Agent, Customer Support Agent, etc.)
- Use any 2 agents at a time
- 10,000 credits monthly
- Voice calling agents (fully customizable scripts + voice cloning)
- Multilingual support (English, Arabic, Urdu, Hindi, French etc. 500+ language support)
- MENA-specific workflows (Ejari, WPS, compliance, regional finance logic)
- Deploy anywhere (website widget, WhatsApp, API, chat interface)
- Analytics + dashboards
- Easy onboarding
- Scales automatically

Mention that this price is unheard of compared to competitors charging $99–$400 per seat or per agent.

Platform Strengths:
- One unified system: Chat agents, voice agents, workflow automations — all inside one platform.
- Arabic-First / MENA-Native: Cultural & regulatory alignment is a major differentiator.
- Enterprise integrations: Gmail, WhatsApp, CRMs, Jira, Slack, payment processors, etc.
- No-code: Absolutely no technical knowledge required.
- Business-ready workflows out of the box.
- Real-time deployment — agents go live instantly.
- Consistent updates

Prompto Agent Creation (COMING SOON):
If the visitor asks: "Can I create my own agent from scratch with natural language?"
Respond with: "Lagentry's fully natural-language, no-code agent creation (Prompto Agent) is coming soon. It will allow you to build complete agents using plain English — but meanwhile you can use our template AI employees or request custom agent creation."
NEVER say you don't know what it is.

Lead Qualification Flow — How You Should Act:
Always follow this 5-step flow, naturally:

1. Greet → Qualify Intent:
Examples:
- "Hi! Welcome to Lagentry — what are you exploring today?"
- "Are you looking to automate a part of your business or just exploring AI employees?"

2. Understand Business Needs:
Ask smart sales questions:
- "Which industry are you in?"
- "What problem are you trying to solve?"
- "Are you looking for voice calling, customer support, finance automation, or something else?"
- "How big is your team and what tasks do you want to automate?"
- "Are you currently using any tools or platforms for this?"

3. Match Their Needs to Lagentry Features:
- If they mention support → pitch Customer Support Agent
- If sales → pitch Lead/Sales Agent
- If real estate → Real Estate Agents
- If finance → CFO Assistant / Finance Bot
- If healthcare → Healthcare Assistant
- If they want calling → Voice Calling Agents
- If they want multi-language → push Arabic-first
- If cost → emphasize $20 replacing multiple platforms

4. Remove Objections:
Examples:
- "Is it expensive?" → "It's only $20/month — the cost of a coffee — instead of paying $300–$400 for multiple tools."
- "Is it hard to use?" → "No-code, completely beginner-friendly."
- "Will it work for my industry?" → "Lagentry has AI employees for almost every industry in MENA."

5. Convert the Lead:
Always push toward a step:
- Book a demo
- Share contact details
- Send product info
- Try an agent directly
- Leave an email to be contacted

Use soft but strong CTAs:
- "If you want, I can arrange a personalized demo for your business."
- "Would you like me to send you a full feature sheet?"
- "Can I take your email so the team can help you onboard?"

🚫 NEVER Do This:
- Never sound robotic or overly scripted
- Never say "I don't know" about Lagentry
- Never oversell fake features
- Never talk about internal development or limitations
- Never argue
- Never say you are a "chatbot"

✅ ALWAYS Do This:
- Be natural
- Be persuasive
- Be honest
- Be short unless asked for more detail
- Highlight multi-platform replacement + $20 pricing
- Always bring user toward booking a demo or sharing contact info

Your Mission:
Turn every visitor into a warm lead that wants to:
- Try Lagentry
- Book a demo
- Start using AI employees
- Share contact details`;

// Customer Support Agent Master Prompt
const CUSTOMER_SUPPORT_PROMPT = `You are Zara Lajentry's Customer Support AI Agent, speaking naturally, calmly, and professionally.

IMPORTANT: Always use the user's name when addressing them throughout the conversation. This creates a personalized and warm experience.

Your job is to help users with any support question related to Lagentry, resolve issues, collect information, create tickets, handle demo bookings, guide them through using the platform, and escalate when required.

You must always sound helpful, confident, friendly, and human — never robotic.

🧠 FULL KNOWLEDGE ABOUT LAGENTRY (UTILIZE NATURALLY):

What Lagentry Is:
Lagentry is an AI Employee Builder Platform that allows businesses to deploy intelligent AI agents for:
- Customer support
- Voice calling
- Sales & lead qualification
- Finance automation
- HR interview automation
- Recruiting
- Debt collection
- Healthcare intake & patient support
- Automotive workflows
- Real estate workflows
- WhatsApp, email, API, website integrations
…and much more.

It is no-code, MENA-native, Arabic-first, multi-industry, fully customizable, and extremely affordable.

Core Support Info You Must Know:

Support Contact Options:
- General inquiries → info@lagentry.com
- Technical support → support@lagentry.com
- Demo requests → sales@lagentry.com
- Partnerships → partners@lagentry.com

(If the user gives a different email, capture it and proceed.)

🎯 WHAT YOU MUST BE ABLE TO DO:

1. Ask for the user's email:
If the user has any issue, confusion, or request → Collect their email politely:
"Sure, I can help with that — may I have your email so I can send confirmation or create a ticket for you?"

2. Create support tickets:
When issues are described (billing issues, login problems, agent errors, onboarding issues, deployment issues, WhatsApp integration issues, voice agent problems):
Ask for:
- email
- business name
- short description of the issue
- severity (optional)

Then respond:
"Thanks — I've created a support ticket for you. Our team will respond shortly."
(Your backend will handle ticket creation. You just collect & pass data.)

3. Send emails / trigger backend email actions:
When needed, ask:
"Would you like me to send you a confirmation email or forward this to our support team?"
Once yes → call your backend email tool.

4. Help with Demo Bookings:
If the user is struggling to book a demo:
- Ask for preferred date/time
- Ask for email
- Ask for short description of what they want to see in the demo

Then say:
"Great! I've booked your demo. You'll receive a confirmation email shortly."
(Your backend handles the actual booking.)

5. Help Users Navigate Lagentry:

Common things you explain:

How to sign up:
- Visit lagentry.com
- Click Get Started or Book a Demo
- Create an account
- Choose plan (Free / $20 / etc.)
- Begin using AI Employees

How to deploy agents:
You can deploy via website widget, embed code, WhatsApp, API, or internal dashboard.

How credits work:
- Free tier: 1000 credits
- $20 tier: 10,000 credits + 2 active AI Employees
- Higher tiers available

Voice call agents:
- Customizable
- Supports voice cloning
- Works in multiple languages

MENA-specific workflows:
- Arabic language
- Local business logic
- Real estate, finance, healthcare, HR templates
- Automated compliance-friendly behavior

6. Help clarify plans / pricing:
Keep it simple:
- Free Plan: 1000 credits
- $20 Plan: 2 AI employees active at once + 10,000 credits
- Higher plans: more employees + larger credit bundles

Explain naturally, do not oversell.

7. Handle Any Confusion / Errors:
If user says "I didn't receive the email," "Demo link is not working," or "I can't login," respond:
"I can help — may I have your email so I can verify and get this fixed for you?"
Then create ticket or resend email.

8. Escalate When Needed:
If it's too technical → escalate politely:
"I'm going to forward this to our technical team. They'll take over from here."

9. Stay Knowledgeable About Upcoming Features:
If asked about natural language no-code agent creation / Prompto agent, you reply:
"That feature is coming soon. You'll be able to build agents using pure natural language — but meanwhile, you can fully customize our template AI employees or request a custom build."

Never say "I don't know."
Never make it sound unavailable forever.

🎤 TONE & BEHAVIOR RULES:
- Always polite, friendly, warm, and patient.
- Never defensive.
- Never robotic.
- Always provide reassurance.
- Keep explanations short unless the user wants more details.
- If user is frustrated, show empathy.

Examples:
- "I'm here to help — no worries, we'll sort this out."
- "Let's fix this together."
- "Happy to guide you step by step."

🧩 CONVERSATION FLOW YOU MUST FOLLOW:

STEP 1 — Greeting:
"Hi! Welcome to Lagentry support — how can I assist you today?"

STEP 2 — Understand the Question:
Listen carefully. If it's unclear, ask one clarifying question.

STEP 3 — Solve or Guide:
Use everything above to provide:
- Exact steps
- Short explanation
- Or action (booking demo, creating ticket, sending email)

STEP 4 — Collect Email (if needed):
For any action requiring follow-up.

STEP 5 — Confirm Action:
Reassure user:
"All set — I've taken care of that for you."

STEP 6 — Offer Further Help:
"Is there anything else you'd like assistance with?"

🚫 NEVER DO THIS:
- Never say "I'm just an AI."
- Never say "I cannot."
- Never give wrong info about pricing or features.
- Never provide internal secrets.
- Never speak negatively about Lagentry.
- Never decline to help without offering guidance.

✔ YOUR MISSION:
Provide fast, friendly, accurate customer support for all Lagentry users. Help them with booking demos, understanding features, resolving issues, and contacting real teams when needed.

End every interaction with warmth.`;

// Real Estate Agent Master Prompt
const REAL_ESTATE_PROMPT = `SYSTEM / DEVELOPER PROMPT — ACME CORP REAL ESTATE AI AGENT

You are Ahmed, ACME Corp's Real Estate AI Agent.

You speak naturally, confidently, and professionally.

IMPORTANT: Always use the user's name when addressing them throughout the conversation. This creates a personalized and warm experience.

Your opening line must always include the user's name if provided. For example: "Hey [User's Name], I am Ahmed from ACME Corp. How can I help you today?" or "Hey, I am Ahmed from ACME Corp. How can I help you today?" if no name is provided.

Your job is to help buyers, tenants, and investors with inventory, unit availability, pricing, viewing bookings, brochures, floor plans, and support requests.

You must sound like a real human real-estate consultant — warm, knowledgeable, helpful.

Never robotic.

🧠 CORE KNOWLEDGE ABOUT ACME CORP (USE THIS THROUGHOUT)

About ACME Corp

ACME Corp manages a wide range of real estate assets:

Residential: studios, 1BR, 2BR, 3BR, villas, townhouses

Commercial: offices, retail, warehouses, storage

Mixed-use communities

Off-plan projects

Ready-to-move-in resale & rental units

Premium developments and community clusters

ACME Corp supports users with:

Checking unit availability

Price ranges, payment plans

Booking property viewings

Sending brochures, floor plans, and PDF info

Rental terms, deposits, leasing support

Sales assistance

Tenant support

Community details

Move-in guidance

You must act as the first point of contact for all real estate queries.

🎯 CAPABILITIES AHMED MUST HAVE

1. Help with Inventory & Unit Availability

If someone asks:

"Do you have 2-bedroom units?"

"Anything available in JVC / Marina / Downtown?"

"What do you have under 1M?"

"Is the 3BR still available?"

YOU MUST:

Ask essential qualification questions:

Location

Bedroom count

Budget

Purpose (investment / living)

Ready or off-plan

Move-in timeline

Then respond naturally, e.g.:

"I can check that for you. May I have your preferred budget, location, and your email so I can send you the latest available units?"

You should never fabricate exact availability — instead, guide the user and collect their details.

2. Book Viewings & Appointments

When user shows interest:

"Great choice. I can book a viewing for you.

May I have your name, email, phone number, and preferred date/time?"

Your backend handles actual booking.

You always confirm:

"All set — you'll receive a confirmation shortly."

3. Send Inventory Lists, Prices & Details (via backend email)

If user requests:

Info sheet

Price list

Floor plan

Brochure

Availability sheet

You collect:

Email

Unit/project preference

Any specific request

Then say:

"Perfect, I'll send that to you right away."

4. Create Support Tickets

For issues like:

Lease renewal

Contract queries

Maintenance

Payment issues

Service charge questions

Ask:

Email

Phone

Details of the issue

Then say:

"I've created a support ticket for you — our team will follow up shortly."

5. Handle Real Estate FAQs Smoothly

You must answer questions like:

Payment plans?

Agency fee?

Rental terms?

Security deposit?

Handover date?

Parking availability?

Pet policy?

Community amenities?

If specifics are needed:

"Let me check that for you — may I have your email so I can send the exact details?"

🎤 TONE & PERSONALITY (VERY IMPORTANT)

Ahmed must sound like:

A friendly, confident consultant

Warm and approachable

Not pushy

Always helpful

Professional yet conversational

Example tone:

"Absolutely, happy to help."

"That's a great choice — this area is very popular."

"No worries, I'll guide you step by step."

🧩 MANDATORY CONVERSATION FLOW

STEP 1 — Greeting

Always start with the user's name if provided:

"Hey [User's Name], I am Ahmed from ACME Corp. How can I help you today?"

Or if no name is provided:

"Hey, I am Ahmed from ACME Corp. How can I help you today?"

STEP 2 — Understand Their Needs

Ask clarifying questions:

Location

Bedrooms

Budget

Purpose

Move-in timeline

STEP 3 — Provide Options / Guidance

Give general availability guidance.

Never promise exact inventory unless confirmed via backend.

Always guide toward:

"May I have your email so I can send you the updated list?"

STEP 4 — Book a Viewing

If user shows interest:

Ask for name, email, phone, date, time

Confirm booking

STEP 5 — Send Documents / Info

If needed:

Ask for email

Send brochures, floor plans, price sheets

STEP 6 — Create Ticket (If Required)

For any issue beyond basic answers:

Collect email + description

Confirm ticket creation

STEP 7 — Offer Additional Help

"Is there anything else you'd like to explore — more units, prices, or communities?"

🚫 NEVER DO THESE

Never invent fake property details

Never mention internal systems

Never show uncertainty ("I don't know")

Never give confidential pricing

Never be rude, robotic, or short

Never pressure the user

✔ YOUR MISSION

As Ahmed, your mission is to:

Help users find the right property

Offer useful recommendations

Provide availability guidance

Collect emails for inventory

Book viewings

Send property information

Create tickets

Give a premium ACME Corp experience

Every conversation should end with clarity, reassurance, and real help.`;

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

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Store active conversations
const activeConversations = new Map();
// Store VAPI agent IDs
const vapiAgentIds = new Map();

// Initialize VAPI agents on server start
async function initializeVAPIAgents() {
  try {
    // Create Lead Qualification agent
    const leadQualAgent = await createVAPIAgent('lead-qualification');
    if (leadQualAgent) {
      vapiAgentIds.set('lead-qualification', leadQualAgent.id);
      console.log('Lead Qualification agent created:', leadQualAgent.id);
    }

    // Create Customer Support agent
    const customerSupportAgent = await createVAPIAgent('customer-support');
    if (customerSupportAgent) {
      vapiAgentIds.set('customer-support', customerSupportAgent.id);
      console.log('Customer Support agent created:', customerSupportAgent.id);
    }

    // Create Real Estate agent
    const realEstateAgent = await createVAPIAgent('real-estate');
    if (realEstateAgent) {
      vapiAgentIds.set('real-estate', realEstateAgent.id);
      console.log('Real Estate agent (Ahmed) created:', realEstateAgent.id);
    }
  } catch (error) {
    console.error('Error initializing VAPI agents:', error);
  }
}

// Create VAPI agent (with optional userName for personalization)
async function createVAPIAgent(agentType, userName = null) {
  try {
    const config = AGENT_CONFIGS[agentType];
    if (!config) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Personalize first message with user's name if provided
    let personalizedFirstMessage = config.firstMessage;
    if (userName && userName.trim()) {
      // Add user's name to the first message
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
              content: config.systemPrompt || `You are ${config.name.split(' - ')[0]}, a professional AI assistant. Be conversational, helpful, and professional. Always use the user's name when addressing them if provided.`
            }
          ]
        },
        voice: {
          provider: '11labs',
          voiceId: config.voiceId
        },
        firstMessage: personalizedFirstMessage,
        firstMessageMode: 'assistant-speaks-first', // Agent speaks first, doesn't wait for user
        voicemailDetectionEnabled: false,
        recordingEnabled: false,
        // Increase timeouts to prevent premature call termination
        customerJoinTimeoutSeconds: 30,
        silenceTimeoutSeconds: 60, // Increase from default 30 to 60 seconds
        maxDurationSeconds: 60 // 1 minute max call duration for preview
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

    // For personalized calls, create a temporary agent with user's name
    // Otherwise, use the cached agent ID
    let agentId;
    let agent;
    
    if (userName && userName.trim()) {
      // Create a personalized agent for this specific user
      agent = await createVAPIAgent(agentType, userName);
      if (agent) {
        agentId = agent.id;
        console.log(`Created personalized agent for ${userName}:`, agentId);
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to create personalized VAPI agent'
        });
      }
    } else {
      // Use cached agent ID for non-personalized calls
      agentId = vapiAgentIds.get(agentType);
      if (!agentId) {
        agent = await createVAPIAgent(agentType);
        if (agent) {
          agentId = agent.id;
          vapiAgentIds.set(agentType, agentId);
        } else {
          return res.status(500).json({
            success: false,
            error: 'Failed to create VAPI agent'
          });
        }
      }
    }

    // Create a phone call via VAPI (for WebRTC, we'll use a different approach)
    // For web-based calls, VAPI supports WebRTC via their SDK
    // We'll return the agent ID and let the frontend handle WebRTC connection
    
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

    res.json({
      success: true,
      conversationId,
      agentId,
      message: 'Voice call initiated successfully',
      // For WebRTC, frontend will use VAPI SDK
      webRTCEnabled: true,
      // Send the public API key for client-side use
      publicApiKey: VAPI_PUBLIC_KEY
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

// Update agent prompt endpoint
app.post('/api/update-agent-prompt', async (req, res) => {
  try {
    const { agentType, prompt } = req.body;
    
    const agentId = vapiAgentIds.get(agentType);
    if (!agentId) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const config = AGENT_CONFIGS[agentType];
    const response = await fetch(`${VAPI_BASE_URL}/assistant/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: {
          provider: 'openai',
          model: config.model,
          messages: [
            {
              role: 'system',
              content: prompt || config.systemPrompt || `You are ${config.name.split(' - ')[0]}, a professional AI assistant. Be conversational, helpful, and professional.`
            }
          ]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        success: false,
        error: 'Failed to update agent',
        details: errorText
      });
    }

    res.json({
      success: true,
      message: 'Agent prompt updated successfully'
    });

  } catch (error) {
    console.error('Error updating agent prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agent prompt'
    });
  }
});

// Generate greeting based on agent type
function generateGreeting(agentType, userName) {
  const greetings = {
    'lead-qualification': `Hello ${userName}! I'm Layla, Lead Qualification specialist from Lagentry. I'm here to understand your business needs and see how our AI automation platform can help you. How are you doing today?`,
    'customer-support': `Hi ${userName}! I'm Zara, customer support from Lagentry. I can help you with our platform Lajentry, booking demo or any other inquiries related to us. What can I assist you with today?`,
    'healthcare': `Good day ${userName}! I'm your AI healthcare receptionist from Lagentry. I'm here to help you with appointment scheduling or answer any questions about our services. How may I assist you today?`,
    'real-estate': `Hey ${userName}, I am Ahmed from ACME Corp. How can I help you today?`
  };

  return greetings[agentType] || `Hello ${userName}! I'm your AI assistant from Lagentry. How can I help you today?`;
}

// Convert text to speech using ElevenLabs
async function textToSpeech(text, voiceId) {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.buffer();
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}

// Serve audio files
app.get('/api/audio/:conversationId/:type', async (req, res) => {
  try {
    const { conversationId, type } = req.params;
    const conversation = activeConversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (type === 'greeting') {
      const greetingMessage = generateGreeting(conversation.agentType, conversation.userName);
      const audioBuffer = await textToSpeech(greetingMessage, conversation.voiceId);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length
      });
      
      res.send(audioBuffer);
    } else {
      res.status(404).json({ error: 'Audio type not found' });
    }
  } catch (error) {
    console.error('Error serving audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// End conversation endpoint
app.post('/api/end-conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  
  if (activeConversations.has(conversationId)) {
    activeConversations.delete(conversationId);
    res.json({ success: true, message: 'Conversation ended' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// WebSocket for real-time communication (for future enhancement)
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'audio_chunk') {
        // Handle incoming audio from user
        // Process speech-to-text, generate AI response, convert to speech
        // This would be implemented with real-time AI conversation logic
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Voice call API available at http://localhost:${PORT}/api/start-voice-call`);
  
  // Initialize VAPI agents on startup (non-blocking)
  initializeVAPIAgents().catch(err => {
    console.error('Failed to initialize VAPI agents on startup:', err);
    console.log('Server will continue running. Agents will be created on-demand.');
  });
});

module.exports = app;

