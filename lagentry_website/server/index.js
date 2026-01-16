require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const {
  sendWaitlistConfirmationEmail,
  sendNewsletterWelcomeEmail,
  sendDemoConfirmationEmail,
  sendDemoInternalNotification,
  sendDemoRescheduledEmail,
  sendDemoCancelledEmail
} = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5001;

// Supabase configuration
// Check for both REACT_APP_ prefixed (for compatibility) and non-prefixed variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://zlcijmyouoasydkamyeb.supabase.co';
// For server-side operations, prefer service_role key (bypasses RLS), fallback to anon key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
const supabase = SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (!SUPABASE_KEY) {
  console.warn('⚠️ Supabase API key is missing! Contact form submissions will not be saved to database.');
  console.warn('Please set SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY environment variable.');
} else {
  const isServiceRole = SUPABASE_KEY.includes('service_role') || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  console.log('✅ Supabase configured successfully');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Using key type:', isServiceRole ? 'service_role (bypasses RLS)' : 'anon (requires RLS policies)');
  console.log('Supabase Key:', SUPABASE_KEY.substring(0, 20) + '...');
}

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

// CORS configuration - CRITICAL for Vercel serverless functions
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'https://lagentry.com',
  'https://www.lagentry.com',
  'https://lagentry-backend.vercel.app',
  'https://lagentry-backend-hyfcigzmb-fahads-projects-f4464ec3.vercel.app',
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

// Helper function to check if origin is allowed
function isOriginAllowed(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin) ||
    origin.includes('lagentry.com') ||
    origin.includes('netlify.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development';
}

// Helper function to set CORS headers
function setCORSHeaders(res, origin) {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

// Helper function to generate Google Calendar link
function generateGoogleCalendarLink({ title, description, location, start, end }) {
  const formatDateForCalendar = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`,
    details: description,
    location: location,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// CRITICAL: Handle OPTIONS preflight requests FIRST - before ANY other middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    console.log('OPTIONS preflight request from:', origin);
    setCORSHeaders(res, origin);
    return res.status(204).end();
  }
  next();
});

// Set CORS headers for all other requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  setCORSHeaders(res, origin);
  next();
});

// Use cors middleware as backup (but OPTIONS already handled above)
// Use cors middleware as backup
app.use(cors({
  origin: '*', // Allow all origins in the express middleware as well, relying on vercel.json for strictness if needed, or Vercel handles it.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  const origin = req.headers.origin;
  setCORSHeaders(res, origin);
  res.json({ status: 'ok', message: 'Backend server is running', cors: 'enabled' });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  const origin = req.headers.origin;
  setCORSHeaders(res, origin);
  res.json({
    message: 'CORS test successful',
    origin: origin,
    allowed: isOriginAllowed(origin)
  });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Save to Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          // Use the existing Supabase table for contact messages
          .from('contact_messages')
          .insert([
            {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          console.error('❌ Supabase insert error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Return error to help debug
          return res.status(500).json({
            success: false,
            message: 'Failed to save to database',
            error: error.message,
            details: error
          });
        }

        console.log('✅ Contact saved to Supabase successfully:', data);
        return res.json({
          success: true,
          message: 'Contact information saved successfully',
          data: data
        });
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
        console.error('Error stack:', supabaseError.stack);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: supabaseError.message
        });
      }
    }

    // Log the contact submission if Supabase is not configured
    console.log('Contact form submission (not saved to DB):', { 
      name, 
      email, 
      timestamp: new Date().toISOString() 
    });

    // Return success response
    res.json({
      success: true,
      message: 'Contact information received successfully'
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to process contact form'
    });
  }
});

// Waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { email, name, company, designation } = req.body;

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

    // Save to Supabase if configured
    if (supabase) {
      try {
        const insertData = {
          email: email.trim().toLowerCase(),
          name: name?.trim() || null,
          company: company?.trim() || null,
          designation: designation?.trim() || null,
          // created_at will be automatically set by the database default (NOW())
        };

        console.log('📝 Attempting to insert into waitlist:', JSON.stringify(insertData, null, 2));

        const { data, error } = await supabase
          .from('waitlist')
          .insert([insertData])
          .select();

        if (error) {
          console.error('❌ Supabase waitlist insert error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));

          // Handle duplicate email gracefully (user already on waitlist)
          if (error.code === '23505' || error.message?.includes('duplicate key value')) {
            console.warn('ℹ️ Waitlist duplicate email – user is already on the waitlist.');
            return res.status(200).json({
              success: true,
              message: 'You are already on the waitlist!',
              duplicate: true
            });
          }
          
          // Check if it's a table not found error
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.error('⚠️ Table "waitlist" does not exist in Supabase. Please create it first.');
            return res.status(500).json({
              success: false,
              message: 'Database table not found. Please contact support.',
              error: error.message,
              hint: 'The waitlist table needs to be created in Supabase'
            });
          }
          
          // Check if it's an RLS (Row Level Security) policy error
          if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
            console.error('⚠️ RLS Policy Error: Insert operation is blocked by Row Level Security.');
            console.error('Please create an INSERT policy for the waitlist table in Supabase.');
            return res.status(500).json({
              success: false,
              message: 'Permission denied. RLS policy may be blocking inserts.',
              error: error.message,
              code: error.code,
              hint: 'Go to Supabase Dashboard > Table Editor > waitlist > RLS policies > Create policy to allow INSERT'
            });
          }
          
          console.error('Full error object:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to save to database',
            error: error.message,
            code: error.code,
            hint: error.hint || 'Check server logs for more details',
            details: error
          });
        }

        console.log('✅ Waitlist entry saved to Supabase successfully:', data);
        
        // Send waitlist confirmation email (non-blocking)
        console.log('📧 Attempting to send waitlist confirmation email to:', email.trim());
        sendWaitlistConfirmationEmail({
          email: email.trim(),
          name: name?.trim() || ''
        }).then(result => {
          if (result.success) {
            console.log('✅ Waitlist confirmation email sent successfully! Message ID:', result.messageId);
          } else {
            console.error('❌ Failed to send waitlist confirmation email:', result.error);
          }
        }).catch(err => {
          console.error('❌ Error sending waitlist confirmation email:', err);
          console.error('Error details:', err.message || err);
        });
        
        return res.json({
          success: true,
          message: 'Successfully joined the waitlist!',
          data: data
        });
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
        console.error('Error stack:', supabaseError.stack);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: supabaseError.message
        });
      }
    }

    // Log the waitlist submission if Supabase is not configured
    console.log('Waitlist submission (not saved to DB):', { 
      email: email.trim(),
      timestamp: new Date().toISOString() 
    });

    // Send waitlist confirmation email even if DB is not configured (non-blocking)
    console.log('📧 Attempting to send waitlist confirmation email to:', email.trim());
    sendWaitlistConfirmationEmail({
      email: email.trim(),
      name: name?.trim() || ''
    }).then(result => {
      if (result.success) {
        console.log('✅ Waitlist confirmation email sent successfully! Message ID:', result.messageId);
      } else {
        console.error('❌ Failed to send waitlist confirmation email:', result.error);
      }
    }).catch(err => {
      console.error('❌ Error sending waitlist confirmation email:', err);
      console.error('Error details:', err.message || err);
    });

    // Return success response even if DB is not configured
    res.json({
      success: true,
      message: 'Successfully joined the waitlist!'
    });
  } catch (error) {
    console.error('Error processing waitlist form:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to process waitlist submission'
    });
  }
});

// Helper function to get backend URL
function getBackendUrl(req) {
  // First try environment variables
  let backendUrl = process.env.BACKEND_URL || process.env.SERVER_URL;
  
  if (!backendUrl) {
    // Try to use Vercel URL if available
    if (process.env.VERCEL_URL) {
      // Vercel deployment - use the VERCEL_URL environment variable
      backendUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.VERCEL) {
      // Vercel deployment - use the default backend URL
      backendUrl = 'https://lagentry-backend.vercel.app';
    } else if (req) {
      // Try to construct from request (for same-domain setups)
      const protocol = req.protocol || (req.secure ? 'https' : 'http');
      const host = req.get('host') || req.headers.host;
      if (host && !host.includes('localhost')) {
        backendUrl = `${protocol}://${host}`;
      }
    }
    
    // Final fallbacks
    if (!backendUrl) {
      backendUrl = process.env.FRONTEND_URL || 'https://lagentry.com';
    }
  }
  
  return backendUrl;
}

// Book Demo endpoint
app.post('/api/book-demo', async (req, res) => {
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

    // Save to Supabase if configured
    if (supabase) {
      try {
        const insertData = {
          full_name: name.trim(),
          work_email: email.trim().toLowerCase(),
          contact_number: phone.trim(),
          company_name: company?.trim() || null,
          company_size: companySize?.trim() || null,
          agent_of_interest: agentOfInterest?.trim() || null,
          demo_request_message: message?.trim() || null,
          selected_date: bookingDate,
          selected_time: bookingTime,
          terms_accepted: true, // Assuming they accepted terms when submitting
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('📝 Attempting to insert into user_submissions:', JSON.stringify(insertData, null, 2));

        // Retry logic for connection timeouts
        let lastError = null;
        let retries = 3;
        let data, error;

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`Attempt ${attempt} of ${retries} to connect to Supabase...`);
            const result = await Promise.race([
              supabase
                .from('user_submissions')
                .insert([insertData])
                .select(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000)
              )
            ]);
            
            data = result.data;
            error = result.error;
            break; // Success, exit retry loop
          } catch (timeoutError) {
            lastError = timeoutError;
            console.warn(`Attempt ${attempt} failed:`, timeoutError.message || timeoutError);
            if (attempt < retries) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        // If we still have an error after retries, use the last error
        if (!data && !error && lastError) {
          error = {
            message: lastError.message || 'Connection timeout',
            code: 'CONNECTION_TIMEOUT',
            details: 'Failed to connect to Supabase after multiple attempts. Please check your internet connection.'
          };
        }

        if (error) {
          console.error('❌ Supabase demo booking insert error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.warn('⚠️ Database save failed, but continuing to send emails...');
          
          // Don't return early - continue to send emails even if DB fails
        } else {
          console.log('✅ Demo booking saved to Supabase successfully');
          console.log('Saved data:', JSON.stringify(data, null, 2));
        }

        // Generate booking token for reschedule/cancel links
        const bookingId = data && data[0] ? data[0].id : null;
        const bookingInfo = Buffer.from(JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          bookingDate: bookingDate,
          bookingTime: bookingTime,
          bookingId: bookingId
        })).toString('base64');

        // Generate meeting link (always do this, even if DB failed)
        const meetingDate = new Date(bookingDate);
        const [hours, minutes] = bookingTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0);
        const endDate = new Date(meetingDate);
        endDate.setHours(endDate.getHours() + 1); // 1 hour meeting
        
        const meetingLink = generateGoogleCalendarLink({
          title: 'Lagentry Demo',
          description: `Demo for ${name.trim()} - Agent: ${agentOfInterest || 'General'}`,
          location: 'Online',
          start: meetingDate,
          end: endDate,
        });

        // Generate reschedule and cancel links (point to backend server)
        const backendUrl = getBackendUrl(req);
        const rescheduleLink = `${backendUrl}/reschedule-demo?token=${bookingInfo}`;
        const cancelLink = `${backendUrl}/cancel-demo?token=${bookingInfo}`;
        
        console.log('🔗 Generated reschedule/cancel links:', { backendUrl, rescheduleLink, cancelLink });

        // Send confirmation email to user (non-blocking) - ALWAYS send, even if DB failed
        console.log('📧 Attempting to send demo confirmation email to user:', email.trim());
        sendDemoConfirmationEmail({
          email: email.trim(),
          name: name.trim(),
          dateTime: bookingDateTime || meetingDate.toISOString(),
          meetingLink: meetingLink,
          agentName: agentOfInterest || 'General',
          userRequirement: message?.trim() || '',
          rescheduleLink: rescheduleLink,
          cancelLink: cancelLink
        }).then(result => {
          if (result.success) {
            console.log('✅ Demo confirmation email sent to user successfully! Message ID:', result.messageId);
          } else {
            console.error('❌ Failed to send demo confirmation email to user:', result.error);
          }
        }).catch(err => {
          console.error('❌ Error sending demo confirmation email to user:', err);
        });

        // Send notification email to internal team (non-blocking) - ALWAYS send, even if DB failed
        console.log('📧 Attempting to send demo notification email to company:', COMPANY_EMAIL);
        sendDemoInternalNotification({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company?.trim() || '',
          companySize: companySize?.trim() || '',
          dateTime: bookingDateTime || meetingDate.toISOString(),
          meetingLink: meetingLink,
          agentName: agentOfInterest || 'General',
          userRequirement: message?.trim() || ''
        }).then(result => {
          if (result.success) {
            console.log('✅ Demo internal notification email sent successfully! Message ID:', result.messageId);
          } else {
            console.error('❌ Failed to send demo internal notification email:', result.error);
          }
        }).catch(err => {
          console.error('❌ Error sending demo internal notification email:', err);
        });

        // Return success even if DB failed (emails are more important)
        if (error) {
          return res.status(200).json({
            success: true,
            message: 'Demo booking received. Emails sent successfully. (Note: Database save failed, but your booking was recorded)',
            warning: 'Database save failed, but emails were sent',
            error: error.message,
            data: null
          });
        }

        return res.json({
          success: true,
          message: 'Demo booking saved successfully',
          data: data
        });
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
        console.error('Error stack:', supabaseError.stack);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: supabaseError.message
        });
      }
    }

    // Log the booking if Supabase is not configured
    console.log('Demo booking (not saved to DB):', { 
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company?.trim() || '',
      bookingDate,
      bookingTime,
      timestamp: new Date().toISOString() 
    });

    // Generate booking token for reschedule/cancel links
    const bookingInfo = Buffer.from(JSON.stringify({
      email: email.trim(),
      name: name.trim(),
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      bookingId: null
    })).toString('base64');

    // Generate meeting link
    const meetingDate = new Date(bookingDate);
    const [hours, minutes] = bookingTime.split(':');
    meetingDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0);
    const endDate = new Date(meetingDate);
    endDate.setHours(endDate.getHours() + 1); // 1 hour meeting
    
    const meetingLink = generateGoogleCalendarLink({
      title: 'Lagentry Demo',
      description: `Demo for ${name.trim()} - Agent: ${agentOfInterest || 'General'}`,
      location: 'Online',
      start: meetingDate,
      end: endDate,
    });

    // Generate reschedule and cancel links (point to backend server)
    const backendUrl = getBackendUrl(req);
    const rescheduleLink = `${backendUrl}/reschedule-demo?token=${bookingInfo}`;
    const cancelLink = `${backendUrl}/cancel-demo?token=${bookingInfo}`;
    
    console.log('🔗 Generated reschedule/cancel links:', { backendUrl, rescheduleLink, cancelLink });

    // Send confirmation email to user (non-blocking)
    console.log('📧 Attempting to send demo confirmation email to user:', email.trim());
    sendDemoConfirmationEmail({
      email: email.trim(),
      name: name.trim(),
      dateTime: bookingDateTime || meetingDate.toISOString(),
      meetingLink: meetingLink,
      agentName: agentOfInterest || 'General',
      userRequirement: message?.trim() || '',
      rescheduleLink: rescheduleLink,
      cancelLink: cancelLink
    }).then(result => {
      if (result.success) {
        console.log('✅ Demo confirmation email sent to user successfully! Message ID:', result.messageId);
      } else {
        console.error('❌ Failed to send demo confirmation email to user:', result.error);
      }
    }).catch(err => {
      console.error('❌ Error sending demo confirmation email to user:', err);
    });

    // Send notification email to internal team (non-blocking)
    console.log('📧 Attempting to send demo notification email to company:', COMPANY_EMAIL);
    sendDemoInternalNotification({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company?.trim() || '',
      companySize: companySize?.trim() || '',
      dateTime: bookingDateTime || meetingDate.toISOString(),
      meetingLink: meetingLink,
      agentName: agentOfInterest || 'General',
      userRequirement: message?.trim() || ''
    }).then(result => {
      if (result.success) {
        console.log('✅ Demo internal notification email sent successfully! Message ID:', result.messageId);
      } else {
        console.error('❌ Failed to send demo internal notification email:', result.error);
      }
    }).catch(err => {
      console.error('❌ Error sending demo internal notification email:', err);
    });

    // Return success response even if DB is not configured
    res.json({
      success: true,
      message: 'Demo booking received successfully'
    });
  } catch (error) {
    console.error('Error processing demo booking:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to process demo booking'
    });
  }
});

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
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

    // Save to Supabase if configured (create newsletter table if needed)
    if (supabase) {
      try {
        const insertData = {
          email: email.trim().toLowerCase(),
          name: name?.trim() || null,
          created_at: new Date().toISOString()
        };

        console.log('📝 Attempting to insert into newsletter:', JSON.stringify(insertData, null, 2));

        const { data, error } = await supabase
          .from('newsletter')
          .insert([insertData])
          .select();

        if (error) {
          // If table doesn't exist, log but continue (non-critical)
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('⚠️ Newsletter table does not exist in Supabase. Email will still be sent.');
          } else {
            console.error('❌ Supabase newsletter insert error:', error);
          }
        } else {
          console.log('✅ Newsletter entry saved to Supabase successfully:', data);
        }
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
        // Continue even if DB fails
      }
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
});

// Get available slots endpoint
app.get('/api/available-slots', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Parse the date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Define all available time slots
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30',
    ];

    // Get current date/time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    // Filter out past slots
    let availableSlots = allTimeSlots;
    
    // If selected date is today, filter out past times
    if (selectedDay.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // minutes since midnight
      
      availableSlots = allTimeSlots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        return slotTime > currentTime + 30; // Only show slots at least 30 minutes in the future
      });
    }

    // Get already booked slots from database (excluding cancelled ones)
    let bookedSlots = [];
    if (supabase) {
      try {
        // Format date for query (YYYY-MM-DD)
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('user_submissions')
          .select('selected_time, status')
          .eq('selected_date', dateStr)
          .or('status.is.null,status.neq.cancelled'); // Include bookings without status or with active status

        if (!error && data) {
          bookedSlots = data.map(booking => {
            // Normalize time format (handle both "09:00" and "09:00 AM" formats)
            let time = booking.selected_time;
            if (time && time.includes(' ')) {
              // Convert "09:00 AM" to "09:00"
              const [timePart, period] = time.split(' ');
              const [hours, minutes] = timePart.split(':');
              let hour24 = parseInt(hours);
              if (period === 'PM' && hour24 !== 12) hour24 += 12;
              if (period === 'AM' && hour24 === 12) hour24 = 0;
              time = `${hour24.toString().padStart(2, '0')}:${minutes}`;
            }
            return time;
          }).filter(Boolean);
        }
      } catch (dbError) {
        console.warn('Could not fetch booked slots from database:', dbError);
        // Continue without filtering if DB fails
      }
    }

    // Remove booked slots from available slots
    availableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    // Format slots for display (convert 24h to 12h with AM/PM)
    const formattedSlots = availableSlots.map(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      return {
        value: slot,
        display: `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
      };
    });

    res.json({
      success: true,
      slots: formattedSlots,
      date: dateStr
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots'
    });
  }
});

// Reschedule demo endpoint (POST for API, GET for page)
app.get('/reschedule-demo', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(`
        <html>
          <head><title>Reschedule Demo</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>Invalid Request</h1>
            <p>Missing booking token. Please use the link from your confirmation email.</p>
          </body>
        </html>
      `);
    }
    
    // Decode booking info
    let bookingInfo;
    try {
      bookingInfo = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (e) {
      return res.status(400).send('<html><body><h1>Invalid token</h1></body></html>');
    }
    
    // Return reschedule page with calendar and available slots
    const backendUrl = getBackendUrl(req);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reschedule Your Demo</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 20px auto; 
              padding: 20px; 
              background: #0a0a0a;
              color: #e6e9ef;
            }
            .container { background: #1a1a1a; border-radius: 12px; padding: 30px; }
            h1 { margin-top: 0; color: #9b5cff; }
            .calendar { margin: 20px 0; }
            .month-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .month-nav button { background: #8B5CF6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
            .month-nav button:hover { background: #7C3AED; }
            .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
            .calendar-day { 
              padding: 12px; 
              text-align: center; 
              border-radius: 6px; 
              cursor: pointer;
              background: #2a2a2a;
              border: 1px solid transparent;
            }
            .calendar-day:hover { border-color: #8B5CF6; background: #3a3a3a; }
            .calendar-day.past { opacity: 0.3; cursor: not-allowed; }
            .calendar-day.selected { background: #8B5CF6; color: white; }
            .calendar-day.today { border: 2px solid #9b5cff; }
            .time-slots { margin-top: 20px; }
            .time-slots-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 10px; 
              margin-top: 15px;
            }
            .time-slot { 
              padding: 12px; 
              background: #2a2a2a; 
              border: 1px solid #3a3a3a; 
              border-radius: 6px; 
              cursor: pointer;
              text-align: center;
            }
            .time-slot:hover { border-color: #8B5CF6; background: #3a3a3a; }
            .time-slot.selected { background: #8B5CF6; color: white; border-color: #8B5CF6; }
            .time-slot.booked { opacity: 0.3; cursor: not-allowed; }
            button.submit { 
              background: #8B5CF6; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 6px; 
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
              width: 100%;
            }
            button.submit:hover { background: #7C3AED; }
            button.submit:disabled { opacity: 0.5; cursor: not-allowed; }
            #message { margin-top: 20px; padding: 15px; border-radius: 6px; }
            .success { background: #10b981; color: white; }
            .error { background: #ef4444; color: white; }
            .loading { color: #9b5cff; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔄 Reschedule Your Demo</h1>
            <p>Hi ${bookingInfo.name || 'there'},</p>
            <p>Please select a new date and available time slot:</p>
            
            <div class="calendar">
              <div class="month-nav">
                <button onclick="changeMonth(-1)">← Previous</button>
                <h2 id="currentMonth"></h2>
                <button onclick="changeMonth(1)">Next →</button>
              </div>
              <div class="calendar-grid" id="calendarGrid"></div>
            </div>
            
            <div class="time-slots" id="timeSlotsSection" style="display: none;">
              <h3>Available Time Slots</h3>
              <div class="time-slots-grid" id="timeSlotsGrid"></div>
            </div>
            
            <button class="submit" id="submitBtn" onclick="rescheduleDemo()" disabled>Reschedule Demo</button>
            <div id="message"></div>
          </div>
          
          <script>
            let selectedDate = null;
            let selectedTime = null;
            let currentMonth = new Date();
            const bookingInfo = ${JSON.stringify(bookingInfo)};
            const backendUrl = '${backendUrl}';
            
            function formatDate(date) {
              return date.toISOString().split('T')[0];
            }
            
            function renderCalendar() {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const daysInMonth = lastDay.getDate();
              const startingDay = firstDay.getDay();
              
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              document.getElementById('currentMonth').textContent = monthNames[month] + ' ' + year;
              
              const grid = document.getElementById('calendarGrid');
              grid.innerHTML = '';
              
              // Day headers
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
                const header = document.createElement('div');
                header.textContent = day;
                header.style.fontWeight = 'bold';
                header.style.color = '#9b5cff';
                grid.appendChild(header);
              });
              
              // Empty cells
              for (let i = 0; i < startingDay; i++) {
                grid.appendChild(document.createElement('div'));
              }
              
              // Days
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;
                
                const dateOnly = new Date(date);
                dateOnly.setHours(0, 0, 0, 0);
                
                if (dateOnly < today) {
                  dayDiv.classList.add('past');
                } else {
                  dayDiv.onclick = () => selectDate(date);
                }
                
                if (dateOnly.getTime() === today.getTime()) {
                  dayDiv.classList.add('today');
                }
                
                if (selectedDate && dateOnly.getTime() === selectedDate.getTime()) {
                  dayDiv.classList.add('selected');
                }
                
                grid.appendChild(dayDiv);
              }
            }
            
            async function selectDate(date) {
              selectedDate = new Date(date);
              selectedDate.setHours(0, 0, 0, 0);
              selectedTime = null;
              document.getElementById('submitBtn').disabled = true;
              
              renderCalendar();
              
              // Fetch available slots (excluding past and booked slots)
              const dateStr = formatDate(selectedDate);
              try {
                const response = await fetch(\`\${backendUrl}/api/available-slots?date=\${dateStr}\`);
                const result = await response.json();
                
                if (result.success && result.slots.length > 0) {
                  displayTimeSlots(result.slots);
                  document.getElementById('timeSlotsSection').style.display = 'block';
                } else {
                  document.getElementById('timeSlotsSection').style.display = 'block';
                  document.getElementById('timeSlotsGrid').innerHTML = '<p style="grid-column: 1/-1; color: #ef4444;">No available slots for this date. Please select another date.</p>';
                }
              } catch (error) {
                document.getElementById('message').innerHTML = '<div class="error">Error loading available slots</div>';
              }
            }
            
            function displayTimeSlots(slots) {
              const grid = document.getElementById('timeSlotsGrid');
              grid.innerHTML = '';
              
              slots.forEach(slot => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'time-slot';
                slotDiv.textContent = slot.display;
                slotDiv.onclick = () => {
                  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                  slotDiv.classList.add('selected');
                  selectedTime = slot.value;
                  document.getElementById('submitBtn').disabled = false;
                };
                grid.appendChild(slotDiv);
              });
            }
            
            function changeMonth(direction) {
              currentMonth.setMonth(currentMonth.getMonth() + direction);
              renderCalendar();
            }
            
            async function rescheduleDemo() {
              if (!selectedDate || !selectedTime) {
                document.getElementById('message').innerHTML = '<div class="error">Please select both date and time</div>';
                return;
              }
              
              const messageDiv = document.getElementById('message');
              messageDiv.innerHTML = '<div class="loading">Processing...</div>';
              document.getElementById('submitBtn').disabled = true;
              
              // Combine date and time
              const [hours, minutes] = selectedTime.split(':');
              const dateTime = new Date(selectedDate);
              dateTime.setHours(parseInt(hours), parseInt(minutes), 0);
              
              try {
                const response = await fetch(\`\${backendUrl}/api/reschedule-demo\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: bookingInfo.email,
                    name: bookingInfo.name,
                    dateTime: dateTime.toISOString(),
                    bookingDate: formatDate(selectedDate),
                    bookingTime: selectedTime,
                    bookingId: bookingInfo.bookingId || null
                  })
                });
                
                const result = await response.json();
                if (result.success) {
                  messageDiv.innerHTML = '<div class="success">✅ Demo rescheduled successfully! Check your email for confirmation.</div>';
                } else {
                  messageDiv.innerHTML = '<div class="error">❌ Error: ' + result.message + '</div>';
                  document.getElementById('submitBtn').disabled = false;
                }
              } catch (error) {
                messageDiv.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
                document.getElementById('submitBtn').disabled = false;
              }
            }
            
            renderCalendar();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('<html><body><h1>Error</h1><p>' + error.message + '</p></body></html>');
  }
});

app.post('/api/reschedule-demo', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { email, name, dateTime, meetingLink, bookingId, bookingDate, bookingTime } = req.body;

    // Validate input
    if (!email || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Email and date/time are required'
      });
    }

    // Update booking in Supabase if bookingId provided
    if (supabase && bookingId) {
      try {
        const { error } = await supabase
          .from('user_submissions')
          .update({
            selected_date: bookingDate || dateTime,
            selected_time: bookingTime || null,
            updated_at: new Date().toISOString(),
            status: 'active' // Reset status when rescheduling
          })
          .eq('id', bookingId);

        if (error) {
          console.error('❌ Error updating booking:', error);
        } else {
          console.log('✅ Booking rescheduled in Supabase');
        }
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
      }
    }

    // Generate meeting link (always generate new one for rescheduled time)
    let finalMeetingLink = meetingLink;
    let meetingDate;
    
    // Use bookingDate and bookingTime if provided (from calendar selection)
    if (bookingDate && bookingTime) {
      meetingDate = new Date(bookingDate);
      const [hours, minutes] = bookingTime.split(':');
      meetingDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0);
    } else if (dateTime) {
      // Fallback to dateTime if bookingDate/Time not provided
      meetingDate = new Date(dateTime);
    }
    
    if (meetingDate && !finalMeetingLink) {
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);
      
      finalMeetingLink = generateGoogleCalendarLink({
        title: 'Lagentry Demo',
        description: `Demo for ${name || 'Guest'}`,
        location: 'Online',
        start: meetingDate,
        end: endDate,
      });
    }

    // Send rescheduled email (non-blocking) - ALWAYS send on successful reschedule
    console.log('📧 Attempting to send rescheduled email to:', email.trim());
    const emailDateTime = meetingDate ? meetingDate.toISOString() : dateTime;
    sendDemoRescheduledEmail({
      email: email.trim(),
      name: name?.trim() || '',
      dateTime: emailDateTime,
      meetingLink: finalMeetingLink
    }).then(result => {
      if (result.success) {
        console.log('✅ Demo rescheduled email sent successfully! Message ID:', result.messageId);
      } else {
        console.error('❌ Failed to send rescheduled email:', result.error);
      }
    }).catch(err => {
      console.error('❌ Error sending rescheduled email:', err);
    });

    res.json({
      success: true,
      message: 'Demo rescheduled successfully'
    });
  } catch (error) {
    console.error('Error rescheduling demo:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule demo'
    });
  }
});

// Cancel demo endpoint (GET for page, POST for API)
app.get('/cancel-demo', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(`
        <html>
          <head><title>Cancel Demo</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>Invalid Request</h1>
            <p>Missing booking token. Please use the link from your confirmation email.</p>
          </body>
        </html>
      `);
    }
    
    // Decode booking info
    let bookingInfo;
    try {
      bookingInfo = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (e) {
      return res.status(400).send('<html><body><h1>Invalid token</h1></body></html>');
    }
    
    // Return simple cancel confirmation page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cancel Your Demo</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            button { padding: 12px 24px; margin: 10px; background: #ef4444; color: white; border: none; cursor: pointer; border-radius: 6px; }
            button:hover { background: #dc2626; }
            .cancel-btn { background: #6b7280; }
            .cancel-btn:hover { background: #4b5563; }
          </style>
        </head>
        <body>
          <h1>Cancel Your Demo</h1>
          <p>Hi ${bookingInfo.name || 'there'},</p>
          <p>Are you sure you want to cancel your demo?</p>
          <div>
            <button onclick="cancelDemo()">Yes, Cancel Demo</button>
            <button class="cancel-btn" onclick="window.close()">No, Keep My Demo</button>
          </div>
          <div id="message"></div>
          <script>
            async function cancelDemo() {
              const messageDiv = document.getElementById('message');
              messageDiv.innerHTML = 'Processing...';
              
              try {
                const response = await fetch('/api/cancel-demo', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: '${bookingInfo.email}',
                    name: '${bookingInfo.name}',
                    bookingId: ${bookingInfo.bookingId ? `'${bookingInfo.bookingId}'` : 'null'}
                  })
                });
                
                const result = await response.json();
                if (result.success) {
                  messageDiv.innerHTML = '<p style="color: green;">✅ Demo cancelled successfully. Check your email for confirmation.</p>';
                } else {
                  messageDiv.innerHTML = '<p style="color: red;">❌ Error: ' + result.message + '</p>';
                }
              } catch (error) {
                messageDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
              }
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('<html><body><h1>Error</h1><p>' + error.message + '</p></body></html>');
  }
});

app.post('/api/cancel-demo', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const { email, name, bookingId } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Update booking status in Supabase if bookingId provided (this frees the slot)
    if (supabase && bookingId) {
      try {
        const { error } = await supabase
          .from('user_submissions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);

        if (error) {
          console.error('❌ Error cancelling booking:', error);
        } else {
          console.log('✅ Booking cancelled in Supabase - slot is now free');
        }
      } catch (supabaseError) {
        console.error('❌ Supabase connection error:', supabaseError);
      }
    }

    // Send cancellation email (non-blocking)
    console.log('📧 Attempting to send cancellation email to:', email.trim());
    sendDemoCancelledEmail({
      email: email.trim(),
      name: name?.trim() || ''
    }).then(result => {
      if (result.success) {
        console.log('✅ Demo cancellation email sent successfully! Message ID:', result.messageId);
      } else {
        console.error('❌ Failed to send cancellation email:', result.error);
      }
    }).catch(err => {
      console.error('❌ Error sending cancellation email:', err);
    });

    res.json({
      success: true,
      message: 'Demo cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling demo:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel demo'
    });
  }
});

// Store active conversations
const activeConversations = new Map();

// Fixed Assistant IDs - Use these instead of creating new assistants
const FIXED_ASSISTANT_IDS = {
  'customer-support': 'f3532a03-0578-4077-82f2-19780af488f2', // Zara
  'lead-qualification': '492b6725-429d-4208-9e45-0d394d24b6c6', // Layla
  'real-estate': '9bf691cb-b73e-4e7e-ab2f-258c6468f5eb' // Ahmed
};

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
        transcriber: {
          provider: 'gladia',
          model: 'fast'
        },
        firstMessage: personalizedFirstMessage,
        firstMessageMode: 'assistant-speaks-first', // Agent speaks first, doesn't wait for user
        voicemailDetectionEnabled: false,
        recordingEnabled: false,
        // Increase timeouts to prevent premature call termination
        customerJoinTimeoutSeconds: 60, // Increased from 30 to 60 seconds
        silenceTimeoutSeconds: 90, // Increased from 60 to 90 seconds
        maxDurationSeconds: 300 // Increased from 60 to 300 seconds (5 minutes) for better testing
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
      // For WebRTC, frontend will use VAPI SDK
      webRTCEnabled: true,
      // Send the public API key for client-side use
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

// Update agent prompt endpoint
app.post('/api/update-agent-prompt', async (req, res) => {
  try {
    const { agentType, prompt } = req.body;

    const agentId = FIXED_ASSISTANT_IDS[agentType];
    if (!agentId) {
      return res.status(404).json({
        success: false,
        error: `No fixed assistant ID configured for agent type: ${agentType}`
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

// ==================== CHATBOT ENDPOINTS ====================

// Simple in-memory storage for conversations (can be replaced with file-based storage if needed)
const chatStorage = {
  conversations: new Map(), // conversationId -> { id, status, created_at, updated_at, handoff_status, messages: [] }
  
  // Get or create conversation
  getOrCreateConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      const now = new Date().toISOString();
      this.conversations.set(conversationId, {
        id: conversationId,
        status: 'active',
        created_at: now,
        updated_at: now,
        handoff_status: 'bot', // 'bot' or 'human'
        handoff_at: null,
        handoff_by: null,
        messages: []
      });
    }
    return this.conversations.get(conversationId);
  },
  
  // Take over conversation (human handoff)
  takeOver(conversationId, adminEmail) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'human';
    conv.handoff_at = new Date().toISOString();
    conv.handoff_by = adminEmail || 'admin';
    conv.updated_at = new Date().toISOString();
    return conv;
  },
  
  // Release conversation back to bot
  releaseToBot(conversationId) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'bot';
    conv.handoff_at = null;
    conv.handoff_by = null;
    conv.updated_at = new Date().toISOString();
    return conv;
  },
  
  // Check if conversation needs human attention
  needsHumanAttention(conversationId) {
    const conv = this.conversations.get(conversationId);
    if (!conv) return false;
    
    // Check for escalation triggers in recent messages
    const recentMessages = conv.messages.slice(-5);
    const userMessages = recentMessages.filter(m => m.role === 'user');
    
    // Check for explicit human requests
    const humanRequestKeywords = [
      'human', 'person', 'agent', 'representative', 'support', 
      'talk to someone', 'speak with', 'help me', 'escalate'
    ];
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (humanRequestKeywords.some(keyword => content.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  },
  
  // Add message to conversation
  addMessage(conversationId, role, content) {
    const conv = this.getOrCreateConversation(conversationId);
    const message = {
      id: crypto.randomUUID(),
      role: role,
      content: content,
      created_at: new Date().toISOString()
    };
    conv.messages.push(message);
    conv.updated_at = new Date().toISOString();
    return message;
  },
  
  // Get conversation messages
  getMessages(conversationId) {
    const conv = this.conversations.get(conversationId);
    return conv ? conv.messages : [];
  },
  
  // Get all conversations
  getAllConversations() {
    return Array.from(this.conversations.values()).map(conv => ({
      id: conv.id,
      status: conv.status,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      messageCount: conv.messages.length
    })).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },
  
  // Take over conversation (human handoff)
  takeOver(conversationId, adminEmail) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'human';
    conv.handoff_at = new Date().toISOString();
    conv.handoff_by = adminEmail || 'admin';
    conv.updated_at = new Date().toISOString();
    return conv;
  },
  
  // Release conversation back to bot
  releaseToBot(conversationId) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'bot';
    conv.handoff_at = null;
    conv.handoff_by = null;
    conv.updated_at = new Date().toISOString();
    return conv;
  },
  
  // Check if conversation needs human attention
  needsHumanAttention(conversationId) {
    const conv = this.conversations.get(conversationId);
    if (!conv) return false;
    
    // Check for escalation triggers in recent messages
    const recentMessages = conv.messages.slice(-5);
    const userMessages = recentMessages.filter(m => m.role === 'user');
    
    // Check for explicit human requests
    const humanRequestKeywords = [
      'human', 'person', 'agent', 'representative', 'support', 
      'talk to someone', 'speak with', 'help me', 'escalate'
    ];
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (humanRequestKeywords.some(keyword => content.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  }
};

// Knowledge base content (from user-provided document)
const LAGENTRY_KNOWLEDGE_BASE = `
Lagentry – Enterprise AI Agents Platform

A comprehensive knowledge base for SMEs in the MENA region

1. Introduction

Lagentry is an enterprise-grade AI agents platform built to help small and mid-sized businesses deploy production-ready AI employees instantly. The platform was originally launched as a no-code AI agent builder but evolved after recognizing that most businesses do not want to design agents from scratch. Instead, they want immediate value. Lagentry now offers ready-made, pre-trained AI agents that require minimal to no setup.

Lagentry is designed with a strong focus on the MENA region, supporting Arabic-first, multilingual communication while remaining globally scalable. It enables businesses to automate operations, improve customer experience, and scale efficiently without increasing headcount.

2. Platform Vision & Philosophy

Lagentry is built on a simple philosophy: businesses should be able to deploy AI the same way they hire employees. No technical complexity, no long onboarding cycles, and no fragmented tools. Each AI agent on Lagentry behaves like a professional employee with a clear role, defined responsibilities, and the ability to interact with systems and customers.

The platform prioritizes reliability, professionalism, and enterprise readiness. Unlike generic chatbots, Lagentry agents are trained for real business workflows, making them suitable for production use from day one.

3. Core Platform Capabilities

• Plug-and-play AI agents with no-code setup
• Pre-trained domain-specific intelligence
• Custom proprietary Large Language Model (LLM)
• Multilingual support with Arabic-first design
• Voice calling agents with realistic speech and voice cloning
• WhatsApp, web chat, and omnichannel deployment
• Website and mobile app embedding
• Integration with 1000+ enterprise and SaaS platforms
• Secure, scalable, enterprise-grade infrastructure
• Real-time monitoring, analytics, and logging

4. AI Agent Architecture

Each Lagentry agent is powered by a proprietary Large Language Model optimized for business workflows. Agents operate with structured reasoning, contextual memory, and tool execution capabilities. They can retrieve information, make decisions, and perform actions across connected systems.

Agents are deployed with guardrails, ensuring compliance, accuracy, and controlled behavior. Human escalation and override mechanisms can be configured where required.

5. Voice Calling Agents

Lagentry offers enterprise-grade voice calling agents capable of handling inbound and outbound calls. These agents can speak naturally, understand caller intent, and respond in real time. Voice cloning enables businesses to maintain brand consistency across voice interactions.

Use cases include sales outreach, customer support hotlines, appointment confirmations, lead qualification, and follow-ups. Voice agents operate 24/7 and scale instantly.

6. AI Agents by Domain

Recruitment & HR: Candidate screening, interview automation, scheduling, HR policy assistance.

Sales: Lead qualification, follow-ups, pipeline automation, meeting booking.

Customer Support: FAQ handling, issue resolution, ticket creation, escalation.

Finance: Invoice reminders, reporting, auditing, financial query handling.

Real Estate: Property inquiries, lead qualification, viewing scheduling.

Healthcare: Appointment scheduling, patient queries, reminders.

7. Integrations & Automation

Lagentry integrates with over 1000 platforms including CRMs, ERPs, databases, messaging platforms, email systems, and internal tools. Agents can execute actions such as creating tickets, sending emails, updating records, and triggering workflows.

8. Security, Privacy & Compliance

Lagentry is built with enterprise-grade security, including encryption, access control, data residency options, and compliance with global data protection standards. The platform ensures businesses maintain full control over their data and AI behavior.

9. Pricing & Plans

Lagentry offers a free trial to allow businesses to experience the platform. Paid plans start at $20 per month and go up to $100 per month. Annual subscriptions include two months free, providing cost-effective scaling.

10. Why Lagentry

Lagentry eliminates AI complexity, reduces operational costs, and enables businesses to deploy AI employees instantly. It is purpose-built for SMEs, optimized for MENA, and designed for real-world production use.

11. Conclusion

Lagentry represents the future of work, where AI agents operate as reliable, scalable digital employees. Businesses using Lagentry gain speed, efficiency, and a competitive edge without increasing operational burden.
`;

// Chatbot system prompt
const CHATBOT_SYSTEM_PROMPT = `You are a helpful and knowledgeable assistant for Lagentry, an enterprise AI agents platform. Your role is to help visitors understand Lagentry's capabilities, answer questions about the platform, and guide them toward booking demos or getting started.

Key Information:
- Lagentry is an enterprise-grade AI agents platform for SMEs in the MENA region
- It offers ready-made, pre-trained AI agents that require minimal setup
- Pricing starts at $20/month with a free trial available
- Supports Arabic-first, multilingual communication
- Integrates with 1000+ platforms
- Offers voice calling agents, web chat, WhatsApp deployment

Your tone should be:
- Professional yet friendly
- Helpful and informative
- Conversational, not robotic
- Focused on helping users understand value

Always guide users toward:
- Booking a demo if they're interested
- Exploring specific agents that match their needs
- Understanding pricing and plans
- Getting started with the platform

If you don't know something specific, acknowledge it and offer to help them find the information or connect them with the team.

Knowledge Base:
${LAGENTRY_KNOWLEDGE_BASE}
`;

// OpenAI API key (should be set as environment variable)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Log OpenAI API key status (without exposing the key)
if (OPENAI_API_KEY) {
  console.log('✅ OpenAI API key loaded successfully');
} else {
  console.warn('⚠️ OpenAI API key not found in environment variables');
  console.warn('   Chatbot will use fallback responses. Set OPENAI_API_KEY in .env file.');
}

// Chat endpoint - handle messages
app.post('/api/chat/message', async (req, res) => {
  let currentConversationId = null;
  
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get or create conversation ID
    currentConversationId = conversationId;
    const isNewConversation = !currentConversationId;
    if (!currentConversationId) {
      currentConversationId = crypto.randomUUID();
    }

    // Get conversation to check handoff status
    const conversation = chatStorage.getOrCreateConversation(currentConversationId);
    
    // If human has taken over, don't process with bot
    if (conversation.handoff_status === 'human') {
      // Save user message but don't process with AI
      chatStorage.addMessage(currentConversationId, 'user', message);
      
      return res.json({
        success: true,
        conversationId: currentConversationId,
        messageId: crypto.randomUUID(),
        response: null, // No bot response - waiting for human
        handoff_status: 'human',
      });
    }

    // Save user message to storage
    chatStorage.addMessage(currentConversationId, 'user', message);
    
    // Send email notification for new conversations
    if (isNewConversation) {
      try {
        const { sendChatNotificationEmail } = require('./emailService');
        if (sendChatNotificationEmail) {
          await sendChatNotificationEmail({
            conversationId: currentConversationId,
            userMessage: message,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (emailError) {
        console.error('Failed to send chat notification email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    // Check if conversation needs human attention
    const needsHuman = chatStorage.needsHumanAttention(currentConversationId);
    if (needsHuman && conversation.handoff_status === 'bot') {
      // Auto-escalate to human (optional - can be disabled)
      // For now, just flag it but continue with bot response
      console.log(`⚠️ Conversation ${currentConversationId} may need human attention`);
    }

    // Get conversation history
    const conversationMessages = chatStorage.getMessages(currentConversationId);
    const conversationHistory = conversationMessages
      .slice(-20) // Last 20 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured. Using fallback response.');
      return res.json({
        success: true,
        conversationId: currentConversationId,
        messageId: crypto.randomUUID(),
        response: 'I apologize, but the AI service is currently being configured. Please contact us at info@lagentry.com for assistance, or visit our website to learn more about Lagentry.',
      });
    }

    console.log('Calling OpenAI API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API error response:', openaiResponse.status, openaiResponse.statusText);
      console.error('❌ Error details:', errorData);
      
      // Try to parse error for better message
      let errorMessage = 'Failed to get AI response';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
        console.error('❌ Parsed error:', errorMessage);
      } catch (e) {
        console.error('❌ Could not parse error response');
      }
      
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const aiData = await openaiResponse.json();
    console.log('✅ OpenAI API response received');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('❌ Unexpected OpenAI response structure:', JSON.stringify(aiData, null, 2));
      throw new Error('Unexpected response format from OpenAI API');
    }
    
    const aiResponse = aiData.choices[0].message.content;
    
    if (!aiResponse) {
      console.error('❌ Empty response from OpenAI');
      throw new Error('Empty response from OpenAI API');
    }
    
    console.log('✅ AI response generated successfully');

    // Save assistant response to storage
    const savedMessage = chatStorage.addMessage(currentConversationId, 'assistant', aiResponse);

    res.json({
      success: true,
      conversationId: currentConversationId,
      messageId: savedMessage.id,
      response: aiResponse,
    });
  } catch (error) {
    console.error('❌ Error processing chat message:', error);
    console.error('❌ Error stack:', error.stack);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    // Return error response but also save a helpful message to the conversation
    const errorMessage = error.message || 'Failed to process message';
    const userFriendlyMessage = 'I apologize, but I encountered an error processing your request. Please try again in a moment.';
    
    // Try to save error message to conversation if we have a conversation ID
    try {
      const convId = req.body?.conversationId || currentConversationId;
      if (convId) {
        chatStorage.addMessage(convId, 'assistant', userFriendlyMessage);
      }
    } catch (saveError) {
      console.error('❌ Failed to save error message:', saveError);
    }
    
    res.status(500).json({
      success: false,
      error: userFriendlyMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

// Get conversation history
app.get('/api/chat/conversation/:conversationId', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { conversationId } = req.params;

    const messages = chatStorage.getMessages(conversationId);

    res.json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error loading conversation:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to load conversation',
    });
  }
});

// Admin endpoints for reviewing and replying to chats
app.get('/api/admin/chats', async (req, res) => {
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
      conversations: conversationsWithStatus.slice(0, 100), // Limit to 100 most recent
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
});

// Admin reply to chat
app.post('/api/admin/chat/:conversationId/reply', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { conversationId } = req.params;
    const { message, adminEmail } = req.body;

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

    // Save admin message to storage (as 'admin' role, but will display as 'human' in UI)
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
});

// Take over conversation (human handoff)
app.post('/api/admin/chat/:conversationId/takeover', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { conversationId } = req.params;
    const { adminEmail } = req.body;

    const conversation = chatStorage.takeOver(conversationId, adminEmail || 'admin');
    
    // Add system message indicating human takeover
    chatStorage.addMessage(conversationId, 'system', 'A human agent has joined the conversation.');

    res.json({
      success: true,
      handoff_status: 'human',
      conversation: conversation,
    });
  } catch (error) {
    console.error('Error taking over conversation:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to take over conversation',
    });
  }
});

// Release conversation back to bot
app.post('/api/admin/chat/:conversationId/release', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { conversationId } = req.params;

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
});

// Get conversation with handoff status
app.get('/api/admin/chat/:conversationId', async (req, res) => {
  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { conversationId } = req.params;
    const conversation = chatStorage.getOrCreateConversation(conversationId);
    const messages = chatStorage.getMessages(conversationId);

    res.json({
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
  } catch (error) {
    console.error('Error loading conversation:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    res.status(500).json({
      success: false,
      error: 'Failed to load conversation',
    });
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

// For Vercel serverless functions, export the app
// For local development, start the server
if (process.env.VERCEL || process.env.NOW) {
  // Running on Vercel - just export the app (serverless function)
  module.exports = app;
} else {
  // Running locally - start the server
  server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Voice call API available at http://localhost:${PORT}/api/start-voice-call`);
    console.log(`Chatbot API available at http://localhost:${PORT}/api/chat/message`);

    // Using fixed assistant IDs - no initialization needed
    console.log('Using fixed assistant IDs:');
    console.log('  - Customer Support (Zara):', FIXED_ASSISTANT_IDS['customer-support']);
    console.log('  - Lead Qualification (Layla):', FIXED_ASSISTANT_IDS['lead-qualification']);
    console.log('  - Real Estate (Ahmed):', FIXED_ASSISTANT_IDS['real-estate']);
    
    // Chatbot status
    if (OPENAI_API_KEY) {
      console.log('✅ Chatbot is ready and will use OpenAI API');
    } else {
      console.log('⚠️  Chatbot will use fallback responses (OpenAI API key not configured)');
    }
  });
  
  // Export app for compatibility
  module.exports = app;
}

