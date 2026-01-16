import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'admin';
  content: string;
  timestamp: Date;
  isPending?: boolean;
}

interface ChatbotProps {
  conversationId?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ conversationId: initialConversationId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load conversation history if conversationId exists
  useEffect(() => {
    if (conversationId && isOpen) {
      loadConversationHistory();
      
      // Poll for new messages (admin replies) every 3 seconds
      const pollInterval = setInterval(() => {
        loadConversationHistory();
      }, 3000);
      
      return () => clearInterval(pollInterval);
    }
  }, [conversationId, isOpen]);

  const loadConversationHistory = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/chat/conversation/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages) {
          const loadedMessages = data.messages.map((msg: any) => {
            // Safely parse timestamp
            let timestamp = new Date();
            if (msg.created_at) {
              timestamp = new Date(msg.created_at);
            } else if (msg.timestamp) {
              timestamp = new Date(msg.timestamp);
            }
            // Validate date
            if (isNaN(timestamp.getTime())) {
              timestamp = new Date();
            }
            
            return {
              id: msg.id,
              role: msg.role === 'admin' ? 'admin' : msg.role, // Keep admin role for display
              content: msg.content,
              timestamp: timestamp,
            };
          });
          
          // Only update if messages changed (to avoid unnecessary re-renders)
          setMessages(prev => {
            if (prev.length !== loadedMessages.length || 
                prev[prev.length - 1]?.id !== loadedMessages[loadedMessages.length - 1]?.id) {
              return loadedMessages;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      // Set conversation ID if this is a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Check if human has taken over
      if (data.handoff_status === 'human') {
        const handoffMessage: Message = {
          id: 'handoff-' + Date.now(),
          role: 'assistant',
          content: 'A human agent has joined the conversation. They will respond shortly.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, handoffMessage]);
        return; // Don't add bot response
      }

      // Add assistant response only if there's a response
      if (data.response) {
        const assistantMessage: Message = {
          id: data.messageId || Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add welcome message when opening for the first time
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! 👋 I\'m here to help you learn about Lagentry. How can I assist you today?',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle-open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <img 
            src="/images/lagentry-Logo.png" 
            alt="Lagentry" 
            className="chatbot-toggle-logo"
          />
        )}
        {!isOpen && messages.length > 0 && (
          <span className="chatbot-notification-badge">{messages.length}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <img 
                src="/images/lagentry-Logo.png" 
                alt="Lagentry Logo" 
                className="chatbot-logo"
              />
              <div className="chatbot-header-info">
                <h3>Lagentry Assistant</h3>
                <p>Ask me anything about Lagentry</p>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={toggleChat}
              aria-label="Close chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => {
              // Check if this is a system message about handoff
              const isHandoffMessage = message.content.includes('human agent has joined') || 
                                      message.content.includes('returned to the AI assistant');
              
              // Show admin messages as human messages
              const displayRole = message.role === 'admin' ? 'human' : message.role;
              
              return (
                <div
                  key={message.id}
                  className={`chatbot-message chatbot-message-${displayRole} ${isHandoffMessage ? 'chatbot-message-handoff' : ''} ${message.role === 'admin' ? 'chatbot-message-human' : ''}`}
                >
                  {isHandoffMessage && (
                    <div className="handoff-indicator">👤</div>
                  )}
                  {message.role === 'admin' && !isHandoffMessage && (
                    <div className="handoff-indicator">👤</div>
                  )}
                  <div className="chatbot-message-content">
                    {message.content}
                  </div>
                  <div className="chatbot-message-time">
                    {message.timestamp && !isNaN(message.timestamp.getTime())
                      ? message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="chatbot-message chatbot-message-assistant">
                <div className="chatbot-message-content">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

