// Vercel serverless function for chat messages
const chatStorage = require('./_shared/chatStorage');
const { sendChatNotificationEmail } = require('./_shared/emailService');
const crypto = require('crypto');

// Knowledge base content
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
      chatStorage.addMessage(currentConversationId, 'user', message);
      
      return res.json({
        success: true,
        conversationId: currentConversationId,
        messageId: crypto.randomUUID(),
        response: null,
        handoff_status: 'human',
      });
    }

    // Save user message to storage
    chatStorage.addMessage(currentConversationId, 'user', message);
    
    // Send email notification for new conversations
    if (isNewConversation) {
      try {
        await sendChatNotificationEmail({
          conversationId: currentConversationId,
          userMessage: message,
          timestamp: new Date().toISOString(),
        });
      } catch (emailError) {
        console.error('Failed to send chat notification email:', emailError);
      }
    }
    
    // Get conversation history
    const conversationMessages = chatStorage.getMessages(currentConversationId);
    const conversationHistory = conversationMessages
      .slice(-20)
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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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
      
      let errorMessage = 'Failed to get AI response';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.error?.message || errorMessage;
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
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    const errorMessage = error.message || 'Failed to process message';
    const userFriendlyMessage = 'I apologize, but I encountered an error processing your request. Please try again in a moment.';
    
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
};

