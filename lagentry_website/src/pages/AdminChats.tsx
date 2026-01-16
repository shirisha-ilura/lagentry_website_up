import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminChats.css';
import { clearAuth, getAdminUsername } from '../utils/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'admin' | 'system';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
  handoff_status?: 'bot' | 'human';
  handoff_at?: string | null;
  handoff_by?: string | null;
  needs_attention?: boolean;
}

const AdminChats: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [adminEmail] = useState(getAdminUsername() || 'admin@lagentry.com'); // Can be made configurable

  // Real-time polling for conversations and messages
  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      loadConversationDetails(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/chats');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversation/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error loading conversation details:', error);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`/api/admin/chat/${selectedConversation}/takeover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: adminEmail,
        }),
      });

      if (response.ok) {
        loadConversationDetails(selectedConversation);
        loadMessages(selectedConversation);
        loadConversations();
      }
    } catch (error) {
      console.error('Error taking over conversation:', error);
      alert('Failed to take over conversation');
    }
  };

  const handleRelease = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`/api/admin/chat/${selectedConversation}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        loadConversationDetails(selectedConversation);
        loadMessages(selectedConversation);
        loadConversations();
      }
    } catch (error) {
      console.error('Error releasing conversation:', error);
      alert('Failed to release conversation');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation || sendingReply) return;

    setSendingReply(true);
    try {
      const response = await fetch(`/api/admin/chat/${selectedConversation}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyText.trim(),
          adminEmail: adminEmail,
        }),
      });

      if (response.ok) {
        setReplyText('');
        loadMessages(selectedConversation);
        loadConversations();
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="admin-chats-container">
      <div className="admin-chats-header">
        <h1>Chat Management</h1>
        <div className="admin-header-actions">
          <span className="admin-username">👤 {getAdminUsername() || 'Admin'}</span>
          <button onClick={loadConversations} className="refresh-btn">
            Refresh
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-chats-layout">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <h2>Conversations ({conversations.length})</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">No conversations yet</div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    selectedConversation === conv.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="conversation-id">
                    {conv.id.substring(0, 8)}...
                  </div>
                  <div className="conversation-meta">
                    <span className="message-count">{conv.messageCount} messages</span>
                    <span className="conversation-date">
                      {formatDate(conv.updated_at)}
                    </span>
                  </div>
                  <div className="conversation-badges">
                    {conv.needs_attention && (
                      <span className="attention-badge">⚠️ Needs Attention</span>
                    )}
                    {conv.handoff_status === 'human' ? (
                      <span className="handoff-badge human">👤 Human</span>
                    ) : (
                      <span className="handoff-badge bot">🤖 Bot</span>
                    )}
                    <span className={`conversation-status status-${conv.status}`}>
                      {conv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages View */}
        <div className="messages-panel">
          {selectedConversation ? (
            <>
              <div className="messages-header">
                <div className="messages-header-top">
                  <h2>Conversation: {selectedConversation.substring(0, 8)}...</h2>
                  {currentConversation && (
                    <div className="handoff-controls">
                      {currentConversation.handoff_status === 'bot' ? (
                        <button
                          onClick={handleTakeover}
                          className="takeover-btn"
                          title="Take over this conversation"
                        >
                          👤 Take Over
                        </button>
                      ) : (
                        <button
                          onClick={handleRelease}
                          className="release-btn"
                          title="Release back to bot"
                        >
                          🤖 Release to Bot
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {currentConversation && (
                  <div className="conversation-info">
                    <span>Created: {formatDate(currentConversation.created_at)}</span>
                    <span>Updated: {formatDate(currentConversation.updated_at)}</span>
                    {currentConversation.handoff_status === 'human' && currentConversation.handoff_at && (
                      <span className="handoff-info">
                        👤 Taken over {formatDate(currentConversation.handoff_at)}
                      </span>
                    )}
                    <span className={`status-badge handoff-${currentConversation.handoff_status || 'bot'}`}>
                      {currentConversation.handoff_status === 'human' ? '👤 Human Active' : '🤖 Bot Active'}
                    </span>
                  </div>
                )}
              </div>

              <div className="messages-list">
                {messages.map((message) => {
                  // Determine display role and class
                  let displayRole: string = message.role;
                  let roleLabel = '🤖 Bot';
                  
                  if (message.role === 'admin') {
                    displayRole = 'human';
                    roleLabel = '👤 Human';
                  } else if (message.role === 'system') {
                    displayRole = 'system';
                    roleLabel = 'ℹ️ System';
                  } else if (message.role === 'user') {
                    roleLabel = '👤 User';
                  } else if (message.role === 'assistant') {
                    roleLabel = '🤖 Bot';
                  }
                  
                  return (
                    <div
                      key={message.id}
                      className={`message-item message-${displayRole} ${message.role === 'system' ? 'message-system' : ''}`}
                    >
                      <div className="message-header">
                        <span className="message-role">
                          {roleLabel}
                        </span>
                        <span className="message-time">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <div className="message-content">{message.content}</div>
                    </div>
                  );
                })}
              </div>

              <form className="reply-form" onSubmit={handleSendReply}>
                <textarea
                  className="reply-input"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
                <button
                  type="submit"
                  className="reply-btn"
                  disabled={!replyText.trim() || sendingReply}
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;

