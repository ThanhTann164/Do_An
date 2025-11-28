import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { chatAPI } from '../services/chat.api';
import websocketService from '../services/websocket';
import '../styles/Chat.css';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Kết nối WebSocket
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    loadConversations();

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (message) => {
      console.log('📨 [Chat] New message received:', message);
      
      // Lấy current user để xác định isMine
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      let currentUserId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.userId;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }

      // Set isMine
      const messageSenderId = message.senderId || message.sender?.userId;
      message.isMine = currentUserId && messageSenderId == currentUserId;
      
      // Cập nhật messages nếu đang xem conversation này
      if (selectedConversation && 
          (message.conversationId === selectedConversation.conversationId || 
           message.ConversationID === selectedConversation.conversationId)) {
        setMessages(prev => {
          const exists = prev.some(m => 
            m.messageId === message.messageId || m.MessageID === message.MessageID
          );
          if (!exists) return [...prev, message];
          return prev;
        });
      }

      // Cập nhật danh sách conversations
      loadConversations();
    };

    websocketService.on('new_message', handleNewMessage);

    return () => {
      websocketService.off('new_message', handleNewMessage);
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const result = await chatAPI.getConversations();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Join conversation room
    websocketService.joinConversation(conversation.conversationId);

    // Load messages
    try {
      const result = await chatAPI.getMessages(conversation.conversationId);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const result = await chatAPI.sendMessage(selectedConversation.conversationId, messageText);
      if (result.success) {
        // Message sẽ được nhận qua WebSocket
        setTimeout(() => {
          setMessages(prev => {
            const exists = prev.some(m => 
              m.messageId === result.data.messageId || m.MessageID === result.data.MessageID
            );
            if (!exists) return [...prev, result.data];
            return prev;
          });
        }, 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'Vừa xong';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
      if (diff < 86400000) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString('vi-VN');
    } catch (err) {
      console.error('Error formatting time:', err);
      return '';
    }
  };

  return (
    <Layout>
      <div className="chat-page">
        <div className="chat-container">
          {/* Sidebar - Danh sách conversations */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h2>Tin nhắn</h2>
            </div>
            <div className="chat-conversations-list">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    className={`conversation-item ${selectedConversation?.conversationId === conv.conversationId ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {(conv.otherUser.fullName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">
                        {conv.otherUser.fullName}
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      <div className="conversation-last-message">
                        {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                      </div>
                    </div>
                    <div className="conversation-time">
                      {conv.lastMessage && formatTime(conv.lastMessage.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main chat area */}
          <div className="chat-main">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-info">
                    <div className="chat-avatar">
                      {(selectedConversation.otherUser.fullName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="chat-header-name">
                        {selectedConversation.otherUser.fullName}
                      </div>
                      <div className="chat-header-role">
                        {selectedConversation.otherUser.role}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.messageId || msg.MessageID || index}
                      className={`chat-message ${msg.isMine ? 'mine' : 'theirs'}`}
                    >
                      <div className="chat-message-content">
                        {msg.messageType === 'image' ? (
                          <img 
                            src={msg.messageText} 
                            alt="Shared image" 
                            className="chat-message-image"
                            onClick={() => window.open(msg.messageText, '_blank')}
                            onError={(e) => {
                              console.error('Image load error:', msg.messageText);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : msg.messageType === 'property_link' && msg.metadata ? (
                          <div className="chat-property-link">
                            <div className="property-link-header">
                              <i className="fas fa-home"></i>
                              <span>Thông tin nhà</span>
                            </div>
                            <div className="property-link-content">
                              {msg.metadata.title && <strong>{msg.metadata.title}</strong>}
                              {msg.metadata.address && <p>{msg.metadata.address}</p>}
                              {msg.metadata.price && <p className="property-price">{msg.metadata.price}</p>}
                            </div>
                            <a 
                              href={msg.messageText} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="property-link-button"
                            >
                              Xem chi tiết
                            </a>
                          </div>
                        ) : (
                          <span>{msg.messageText}</span>
                        )}
                      </div>
                      <div className="chat-message-time">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="chat-input"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim() || sending}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty">
                <i className="fas fa-comments fa-3x mb-3 text-muted"></i>
                <p className="text-muted">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
