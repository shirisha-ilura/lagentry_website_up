# Chatbot Setup Guide

This guide will help you set up the Lagentry chatbot system with knowledge base integration and admin review capabilities.

## Features

- ✅ Chatbot widget at bottom-right of all pages
- ✅ OpenAI-powered responses using GPT-4o-mini
- ✅ Knowledge base with Lagentry information
- ✅ Admin interface to review and reply to chats
- ✅ Simple in-memory storage (no database required)

## Prerequisites

1. **OpenAI API Key** - Get one from https://platform.openai.com/api-keys

## Setup Steps

### 1. Configure Environment Variables

Add to your `.env` file in the `server/` directory:

```env
# OpenAI API Key (required for chatbot responses)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Start the Server

```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

### 3. Access the Chatbot

The chatbot will automatically appear on all pages as a floating button in the bottom-right corner.

### 4. Access Admin Interface

Navigate to `/admin/chats` to:
- View all conversations
- Read message history
- Reply to users as admin

## Knowledge Base

The chatbot uses a comprehensive knowledge base that includes:

1. **User-provided document** - The Lagentry knowledge base document embedded in the code
2. **System prompt** - Instructions for the chatbot's behavior

The knowledge base is embedded in the `CHATBOT_SYSTEM_PROMPT` in `server/index.js`. You can update it anytime to improve responses.

## Storage

The chatbot uses **in-memory storage** - conversations are stored in memory while the server is running. This means:
- ✅ No database setup required
- ✅ Simple and fast
- ⚠️ Conversations are lost when server restarts

If you need persistent storage, you can:
- Add file-based storage (JSON file)
- Integrate with your preferred database
- Use a cloud storage service

## API Endpoints

### Chat Endpoints

- `POST /api/chat/message` - Send a message and get AI response
- `GET /api/chat/conversation/:conversationId` - Get conversation history

### Admin Endpoints

- `GET /api/admin/chats` - List all conversations
- `POST /api/admin/chat/:conversationId/reply` - Send admin reply

## Customization

### Update Knowledge Base

Edit the `LAGENTRY_KNOWLEDGE_BASE` constant in `server/index.js` to add or update information.

### Change Chatbot Appearance

Edit `src/components/Chatbot.css` to customize:
- Colors
- Size
- Position
- Animations

### Modify System Prompt

Edit the `CHATBOT_SYSTEM_PROMPT` in `server/index.js` to change:
- Chatbot personality
- Response style
- Instructions

## Troubleshooting

### Chatbot not appearing

- Check browser console for errors
- Ensure the server is running
- Verify CORS is configured correctly

### No AI responses

- Check OpenAI API key is set correctly
- Verify API key has credits
- Check server logs for errors

## Security Notes

1. **OpenAI API Key** - Keep it secure, never commit to git
2. **Admin Interface** - Consider adding authentication for `/admin/chats`
3. **Rate Limiting** - Consider adding rate limiting to chat endpoints

## Next Steps

1. Add authentication to admin interface
2. Implement rate limiting
3. Add persistent storage (file-based or database)
4. Add analytics for chat conversations
5. Set up email notifications for new conversations
6. Integrate with CRM for lead capture

## Support

For issues or questions, check:
- Server logs in terminal
- Browser console for frontend errors

