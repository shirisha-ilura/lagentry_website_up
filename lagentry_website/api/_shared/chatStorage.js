// Shared chat storage for Vercel serverless functions
// Note: This uses in-memory storage which resets on cold starts
// For production, consider using a database or Vercel KV

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Use /tmp directory for persistence (available in Vercel serverless functions)
const STORAGE_FILE = '/tmp/chatStorage.json';

// In-memory cache
let storageCache = null;

function loadStorage() {
  if (storageCache) {
    return storageCache;
  }
  
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      storageCache = JSON.parse(data);
      // Convert arrays back to Maps
      if (storageCache.conversations) {
        const conversationsMap = new Map();
        for (const [key, value] of Object.entries(storageCache.conversations)) {
          conversationsMap.set(key, value);
        }
        storageCache.conversations = conversationsMap;
      } else {
        storageCache.conversations = new Map();
      }
    } else {
      storageCache = {
        conversations: new Map()
      };
    }
  } catch (error) {
    console.error('Error loading storage:', error);
    storageCache = {
      conversations: new Map()
    };
  }
  
  return storageCache;
}

function saveStorage() {
  try {
    const data = {
      conversations: {}
    };
    
    // Convert Map to object for JSON serialization
    for (const [key, value] of storageCache.conversations.entries()) {
      data.conversations[key] = value;
    }
    
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving storage:', error);
  }
}

const chatStorage = {
  get conversations() {
    const storage = loadStorage();
    return storage.conversations;
  },
  
  // Get or create conversation
  getOrCreateConversation(conversationId) {
    const storage = loadStorage();
    if (!storage.conversations.has(conversationId)) {
      const now = new Date().toISOString();
      storage.conversations.set(conversationId, {
        id: conversationId,
        status: 'active',
        created_at: now,
        updated_at: now,
        handoff_status: 'bot',
        handoff_at: null,
        handoff_by: null,
        messages: []
      });
      saveStorage();
    }
    return storage.conversations.get(conversationId);
  },
  
  // Take over conversation (human handoff)
  takeOver(conversationId, adminEmail) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'human';
    conv.handoff_at = new Date().toISOString();
    conv.handoff_by = adminEmail || 'admin';
    conv.updated_at = new Date().toISOString();
    saveStorage();
    return conv;
  },
  
  // Release conversation back to bot
  releaseToBot(conversationId) {
    const conv = this.getOrCreateConversation(conversationId);
    conv.handoff_status = 'bot';
    conv.handoff_at = null;
    conv.handoff_by = null;
    conv.updated_at = new Date().toISOString();
    saveStorage();
    return conv;
  },
  
  // Check if conversation needs human attention
  needsHumanAttention(conversationId) {
    const conv = this.conversations.get(conversationId);
    if (!conv) return false;
    
    const recentMessages = conv.messages.slice(-5);
    const userMessages = recentMessages.filter(m => m.role === 'user');
    
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
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    conv.messages.push(message);
    conv.updated_at = new Date().toISOString();
    saveStorage();
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
  }
};

module.exports = chatStorage;

