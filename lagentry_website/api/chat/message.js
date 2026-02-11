const crypto = require('crypto');
const fetch = require('node-fetch');
const chatStorage = require('../_shared/chatStorage');

// OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LAGENTRY_OPENAI_API_KEY;

// Knowledge base from the monolith (simplified or included)
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
                features: ["1,000 credits", "Chat with 1 AI Employee", "Voice agents", "Community support"]
            },
            {
                id: "hobby-20",
                name: "Hobby",
                price: "$20",
                period: "month",
                features: ["Any 2 AI Employees", "10,000 credits", "Chat widget", "Workflow editor"]
            },
            {
                id: "startup-80",
                name: "Startup",
                price: "$80",
                period: "month",
                features: ["Up to 5 AI Employees", "50,000 credits", "Team collab"]
            },
            {
                id: "growth-100",
                name: "Growth",
                price: "$100",
                period: "month",
                features: ["Up to 10 AI Employees", "100,000 credits", "Custom builder", "API access"]
            }
        ]
    }
};

const CHATBOT_SYSTEM_PROMPT = `You are Lagentry AI assistant. You have comprehensive information about Lagentry including pricing, contact details, available agents, and features.
IMPORTANT: Use ONLY the provided knowledge base to answer questions. Always provide specific, accurate information.
Tone: Professional, friendly, helpful.
Guide users toward booking a demo (https://lagentry.com/book-demo) or joining waitlist (https://lagentry.com/waitlist).`;

// CORS helper
function setCORSHeaders(res, origin) {
    const allowedOrigins = [
        'https://lagentry.com',
        'https://www.lagentry.com',
        'https://lagentry-backend.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);

    if (origin && (allowedOrigins.includes(origin) || origin.includes('lagentry.com'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async (req, res) => {
    const origin = req.headers.origin;

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        setCORSHeaders(res, origin);
        return res.status(204).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        setCORSHeaders(res, origin);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        setCORSHeaders(res, origin);

        const { message, conversationId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Get or create conversation ID
        let currentId = conversationId || crypto.randomUUID();

        // Get conversation to check handoff status
        const conversation = chatStorage.getOrCreateConversation(currentId);

        // If human has taken over, don't process with bot
        if (conversation.handoff_status === 'human') {
            chatStorage.addMessage(currentId, 'user', message);
            return res.json({
                success: true,
                conversationId: currentId,
                response: null,
                handoff_status: 'human'
            });
        }

        // Save user message to storage
        chatStorage.addMessage(currentId, 'user', message);

        // Get conversation history
        const conversationMessages = chatStorage.getMessages(currentId);
        const conversationHistory = conversationMessages
            .slice(-10)
            .map(msg => ({ role: msg.role, content: msg.content }));

        // Call OpenAI
        if (!OPENAI_API_KEY) {
            const fallback = "I'm sorry, I'm currently having trouble connecting to my brain. Please email us at info@lagentry.com.";
            chatStorage.addMessage(currentId, 'assistant', fallback);
            return res.json({ success: true, conversationId: currentId, response: fallback });
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
                    { role: 'system', content: `Knowledge Base: ${JSON.stringify(knowledgeBase)}` },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!openaiResponse.ok) {
            throw new Error(`OpenAI error: ${openaiResponse.statusText}`);
        }

        const aiData = await openaiResponse.json();
        const aiResponse = aiData.choices[0].message.content;

        // Save assistant response
        const savedMsg = chatStorage.addMessage(currentId, 'assistant', aiResponse);

        return res.json({
            success: true,
            conversationId: currentId,
            messageId: savedMsg.id,
            response: aiResponse
        });

    } catch (error) {
        console.error('Error in chat/message:', error);
        setCORSHeaders(res, origin);
        return res.status(500).json({
            success: false,
            error: 'Failed to process message. Please try again later.'
        });
    }
};
