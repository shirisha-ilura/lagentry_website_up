// New lightweight chatbot endpoint: /api/chat
// Frontend Chat UI -> /api/chat -> OpenAI API (with knowledge base context)

// Knowledge base (inline for Vercel serverless compatibility)
const knowledgeBase = {
  company: {
    name: "Lagentry",
    tagline: "AI Employee Platform for MENA",
    description: "Lagentry is an AI Employee platform that lets businesses hire, deploy, and manage AI agents that behave like real employees. It focuses on SMEs in the UAE and wider MENA region, with AI employees for customer support, real estate, HR, and more.",
    region_focus: "UAE and MENA",
    waitlist_size: "5000+",
    website: "https://lagentry.com",
    join_waitlist_url: "https://lagentry.com/waitlist",
    pricing_url: "https://lagentry.com/pricing"
  },
  contacts: {
    support_email: "support@lagentry.com",
    sales_email: "sales@lagentry.com",
    info_email: "info@lagentry.com",
    phone: "+971-XX-XXX-XXXX",
    contact_page: "https://lagentry.com/contact",
    book_demo_url: "https://lagentry.com/book-demo"
  },
  pricing: {
    plans: [
      {
        id: "basic-free",
        name: "Basic",
        price: "$0",
        period: "month",
        description: "Perfect for individuals exploring AI Employees for the first time",
        features: [
          "1,000 credits on signup",
          "Chat with any 1 AI Employee",
          "Voice agents",
          "Try conversational flows",
          "Test knowledge base uploads",
          "Insights & usage report",
          "Community support",
          "Access to Lagentry Marketplace",
          "1000+ integrations"
        ],
        whoIsItFor: "Individuals, freelancers, and early testers who want to understand how Lagentry AI Employees work before committing."
      },
      {
        id: "hobby-20",
        name: "Hobby",
        price: "$20",
        period: "month",
        description: "Ideal for small teams & solo founders getting started with automation",
        features: [
          "Everything in Basic, plus",
          "Use any 2 AI Employees at a time",
          "10,000 monthly credits",
          "Deploy agents with chat widget + dashboard",
          "Access to AI Employee templates",
          "Voice agents",
          "Multilingual support",
          "Workflow editor",
          "Analytics dashboard",
          "Email integration",
          "File upload for internal knowledge",
          "1000+ integrations"
        ],
        whoIsItFor: "Small founders, early-stage startups, individual agents who want automation without heavy setup."
      },
      {
        id: "startup-80",
        name: "Startup",
        price: "$80",
        period: "month",
        description: "For growing teams ready to deploy AI Employees into real workflows",
        features: [
          "Everything in Hobby, plus",
          "Use up to 5 AI Employees at a time",
          "50,000 monthly credits",
          "Iframe Embeds",
          "Voice agents",
          "1000+ integrations",
          "Advanced analytics & custom dashboards",
          "Fine-tuning knowledge base",
          "Team collaboration",
          "Agent personality customization",
          "Multi-language skill pack"
        ],
        whoIsItFor: "Startups & small businesses wanting to create automated workflows: customer support, property management, sales outreach automation, ticketing."
      },
      {
        id: "growth-100",
        name: "Growth",
        price: "$100",
        period: "month",
        description: "Best for businesses scaling operations with multiple AI Employees",
        features: [
          "Everything in Startup, plus",
          "Use up to 10 AI Employees at a time",
          "100,000 monthly credits",
          "Custom AI Employee builder",
          "Priority access to new AI employee templates",
          "Private deployment",
          "Collaboration for up to 10 users",
          "Voice agents",
          "Full access to voice cloning",
          "Advanced workflow automations",
          "API access",
          "Webhooks",
          "CRM bi-directional sync",
          "Advanced security: encryption, audit logs",
          "1000+ integrations"
        ],
        whoIsItFor: "Agencies, operations teams, SME businesses scaling their support, sales, HR, finance, and real-estate flows using AI Employees."
      }
    ],
    yearly_discount: "Save 2 months when paying yearly (10 months for the price of 12)",
    note: "All plans include access to 1000+ integrations via Composio. Pricing is competitive compared to alternatives charging $99-$400 per seat or per agent."
  },
  agents: {
    phase_one: [
      {
        name: "Customer Support AI Employee",
        description: "Handles customer inquiries, support tickets, and provides 24/7 assistance",
        use_cases: ["Customer support", "Help desk", "FAQ handling", "Ticket management"]
      },
      {
        name: "Real Estate AI Employee",
        description: "Manages property inquiries, lead qualification, viewing scheduling",
        use_cases: ["Property inquiries", "Lead qualification", "Viewing scheduling", "Client communication"]
      },
      {
        name: "HR / Recruitment AI Employee",
        description: "Handles recruitment, candidate screening, and HR workflows",
        use_cases: ["Job screening", "Candidate interviews", "HR automation", "Recruitment workflows"]
      },
      {
        name: "Lead Qualification AI Employee (Layla)",
        description: "Qualifies leads, understands business needs, and guides prospects",
        use_cases: ["Sales outreach", "Lead qualification", "Business needs assessment", "Prospect engagement"]
      }
    ],
    additional_agents: [
      "Finance Agent",
      "CFO Assistant",
      "Debt Collection Agent",
      "Healthcare Assistant",
      "Automotive Agent"
    ],
    channels: [
      "Website chat",
      "WhatsApp",
      "Email",
      "Voice calling",
      "API and integrations"
    ],
    capabilities: [
      "24/7 availability",
      "Multilingual support (500+ languages)",
      "Voice cloning",
      "Customizable scripts",
      "Workflow automation",
      "Knowledge base integration"
    ]
  },
  capabilities: {
    integrations: [
      "WhatsApp integration",
      "Email automation",
      "CRM integration (HubSpot, Salesforce, etc.)",
      "Jira / ticketing tools",
      "MCP integrations",
      "1000+ apps via Composio",
      "Slack",
      "Payment processors",
      "Gmail",
      "And many more"
    ],
    ai_features: [
      "Voice AI and phone agents",
      "OCR for reading documents and images",
      "Multi-language support (Arabic and English as primary, 500+ languages supported)",
      "Website embedding (widgets and chat on site)",
      "Voice cloning",
      "Custom agent personalities",
      "Workflow automation",
      "Analytics and reporting"
    ]
  },
  positioning: {
    core_idea: "Lagentry provides multi-channel AI employees that can handle entire workflows, not just answer FAQ-style questions.",
    unique_selling_proposition: "Lagentry replaces multiple expensive tools in ONE platform — for only $20 per month. Instead of paying for 4-6 separate platforms, you pay the price of a coffee and get fully working AI employees.",
    target_users: [
      "SMEs in the UAE",
      "MENA businesses that need Arabic + English support",
      "Teams that want AI to behave like employees (support, HR, real estate, sales)",
      "Small founders and early-stage startups",
      "Agencies and operations teams"
    ],
    advantages: [
      "One unified system: Chat agents, voice agents, workflow automations — all inside one platform",
      "Arabic-First / MENA-Native: Cultural & regulatory alignment",
      "Enterprise integrations: 1000+ platforms",
      "No-code: Absolutely no technical knowledge required",
      "Business-ready workflows out of the box",
      "Real-time deployment — agents go live instantly"
    ]
  }
};

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
You are Lagentry AI assistant. You have comprehensive information about Lagentry including pricing, contact details, available agents, and features.

You answer questions using the knowledge base provided to you. Always provide specific, accurate information when asked about pricing, contact info, agents, or features.

IMPORTANT INFORMATION YOU CAN SHARE:

PRICING PLANS:
- Basic Plan: FREE - 1,000 credits, 1 AI Employee, voice agents, community support, marketplace access, 1000+ integrations
- Hobby Plan: $20/month - 2 AI Employees, 10,000 credits, workflow editor, analytics, multilingual support
- Startup Plan: $80/month - 5 AI Employees, 50,000 credits, advanced analytics, team collaboration
- Growth Plan: $100/month - 10 AI Employees, 100,000 credits, custom builder, API access, private deployment
- Yearly plans save 2 months (10 months for price of 12)
- All plans include 1000+ integrations via Composio
- Visit https://lagentry.com/pricing for full details

CONTACT INFORMATION:
- Support: support@lagentry.com
- Sales: sales@lagentry.com
- General: info@lagentry.com
- Website: https://lagentry.com
- Book Demo: https://lagentry.com/book-demo
- Pricing: https://lagentry.com/pricing

AVAILABLE AI EMPLOYEES:
- Customer Support AI Employee - 24/7 customer inquiries and support
- Real Estate AI Employee - Property inquiries and lead qualification
- HR / Recruitment AI Employee - Recruitment and candidate screening
- Lead Qualification AI Employee (Layla) - Sales outreach and lead qualification
- Plus: Finance Agent, CFO Assistant, Debt Collection Agent, Healthcare Assistant, Automotive Agent

All agents support: Website chat, WhatsApp, Email, Voice calling, API integrations

FEATURES:
- 1000+ integrations (WhatsApp, Gmail, CRM, Jira, Slack, etc.)
- Voice AI with voice cloning
- Multilingual support (500+ languages, Arabic-first)
- No-code setup
- Real-time deployment
- Analytics and reporting
- Workflow automation

Your tone:
- Clear and confident
- Friendly and concise
- Helpful, not salesy
- Specific and accurate when providing information

When asked about pricing: Provide specific plan details, prices, and features. Direct to https://lagentry.com/pricing for full details.
When asked about contact: Provide specific email addresses and website links.
When asked about agents: List available agents with descriptions and use cases.

If something is not in the knowledge base, clearly say you don't have that information and gently guide users to contact support@lagentry.com or visit https://lagentry.com.

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
      console.error('❌ OpenAI API key missing in Vercel environment variables');
      console.error('   Checked: OPENAI_API_KEY =', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
      console.error('   Checked: LAGENTRY_OPENAI_API_KEY =', process.env.LAGENTRY_OPENAI_API_KEY ? 'SET' : 'NOT SET');
      return res.status(500).json({
        success: false,
        error: 'Chat is not configured yet. Missing OpenAI API key on the server.'
      });
    }
    
    // Log that key is found (without exposing it)
    console.log('✅ OpenAI API key found:', OPENAI_API_KEY.substring(0, 7) + '...' + OPENAI_API_KEY.slice(-4));

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

    console.log('📤 Calling OpenAI API with model: gpt-4o');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 OpenAI API response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ OpenAI API error:', response.status);
      console.error('❌ Response body:', text);
      
      let errorMessage = 'Failed to get a response from the assistant.';
      try {
        const errorData = JSON.parse(text);
        console.error('❌ Parsed error data:', JSON.stringify(errorData, null, 2));
        
        if (errorData.error?.code === 'insufficient_quota' || errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('exceeded')) {
          errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing and quota settings at https://platform.openai.com/account/billing.';
        } else if (errorData.error?.code === 'invalid_api_key') {
          errorMessage = 'Invalid OpenAI API key. Please check your Vercel environment variables.';
        } else if (errorData.error?.code === 'model_not_found') {
          errorMessage = 'OpenAI model not found. Please check the model name.';
        } else if (errorData.error?.message) {
          errorMessage = `OpenAI API error: ${errorData.error.message}`;
        }
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        console.error('❌ Raw error text:', text);
      }
      
      setCORSHeaders(res, origin);
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }

    const json = await response.json();
    const reply =
      json?.choices?.[0]?.message?.content?.trim() ||
      "I'm here to answer questions about Lagentry based on the knowledge I have.";

    console.log('✅ Successfully got response from OpenAI');
    setCORSHeaders(res, origin);
    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unexpected error while processing your message. Please try again.'
    });
  }
};

