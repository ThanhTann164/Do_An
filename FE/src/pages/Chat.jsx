import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { chatAPI } from '../services/chat.api';
import websocketService from '../services/websocket';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Send, 
  Info,
  Home,
  Circle
} from 'lucide-react';
import '../styles/Chat.css';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

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
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.otherUser.fullName?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.text?.toLowerCase().includes(searchLower)
    );
  });

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
      {/* Premium Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-7xl mx-auto h-[calc(100vh-4rem)]"
        >
          {/* Glassmorphism Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-full flex overflow-hidden">
            {/* Sidebar - 30% width */}
            <div className="w-full lg:w-[30%] border-r border-gray-200/50 flex flex-col bg-white/50">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200/50 bg-white/80">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tin nhắn</h2>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredConversations.map((conv, index) => (
                      <motion.div
                        key={conv.conversationId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative px-4 py-3 cursor-pointer transition-all duration-200 ${
                          selectedConversation?.conversationId === conv.conversationId
                            ? 'bg-emerald-500 text-white'
                            : 'hover:bg-emerald-50'
                        }`}
                        onClick={() => selectConversation(conv)}
                      >
                        {/* Active Indicator */}
                        {selectedConversation?.conversationId === conv.conversationId && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                        
                        <div className="flex items-center gap-3">
                          {/* Avatar with Online Status */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              selectedConversation?.conversationId === conv.conversationId
                                ? 'bg-white/20'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                              {(conv.otherUser.fullName || 'U')[0].toUpperCase()}
                            </div>
                            {/* Online Status Dot */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>

                          {/* Conversation Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-sm truncate ${
                                selectedConversation?.conversationId === conv.conversationId
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}>
                                {conv.otherUser.fullName}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                  selectedConversation?.conversationId === conv.conversationId
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-500 text-white'
                                }`}>
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs truncate ${
                              selectedConversation?.conversationId === conv.conversationId
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}>
                              {conv.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                            </div>
                          </div>

                          {/* Time */}
                          {conv.lastMessage && (
                            <div className={`text-xs flex-shrink-0 ${
                              selectedConversation?.conversationId === conv.conversationId
                                ? 'text-white/70'
                                : 'text-gray-400'
                            }`}>
                              {formatTime(conv.lastMessage.createdAt)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Chat Window - 70% width */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                            {(selectedConversation.otherUser.fullName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {selectedConversation.otherUser.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedConversation.otherUser.role}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Info className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
                  >
                    <AnimatePresence>
                      {messages.map((msg, index) => {
                        const isMine = msg.isMine;
                        return (
                          <motion.div
                            key={msg.messageId || msg.MessageID || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex flex-col max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`px-4 py-3 rounded-2xl ${
                                  isMine
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md shadow-lg'
                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                                }`}
                              >
                                {msg.messageType === 'image' ? (
                                  <img 
                                    src={msg.messageText} 
                                    alt="Shared image" 
                                    className="max-w-full max-h-96 rounded-lg cursor-pointer"
                                    onClick={() => window.open(msg.messageText, '_blank')}
                                    onError={(e) => {
                                      console.error('Image load error:', msg.messageText);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : msg.messageType === 'property_link' && msg.metadata ? (
                                  <div className={`rounded-xl p-4 ${
                                    isMine ? 'bg-white/20' : 'bg-gray-50'
                                  }`}>
                                    <div className={`flex items-center gap-2 mb-3 ${
                                      isMine ? 'text-white' : 'text-emerald-600'
                                    }`}>
                                      <Home className="w-4 h-4" />
                                      <span className="font-semibold text-sm">Thông tin nhà</span>
                                    </div>
                                    <div className="space-y-2">
                                      {msg.metadata.title && (
                                        <div className={`font-bold ${
                                          isMine ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {msg.metadata.title}
                                        </div>
                                      )}
                                      {msg.metadata.address && (
                                        <div className={`text-sm ${
                                          isMine ? 'text-white/90' : 'text-gray-600'
                                        }`}>
                                          {msg.metadata.address}
                                        </div>
                                      )}
                                      {msg.metadata.price && (
                                        <div className={`font-bold text-sm ${
                                          isMine ? 'text-white' : 'text-emerald-600'
                                        }`}>
                                          {msg.metadata.price}
                                        </div>
                                      )}
                                    </div>
                                    <a 
                                      href={msg.messageText} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`mt-3 inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        isMine
                                          ? 'bg-white text-emerald-600 hover:bg-white/90'
                                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                      }`}
                                    >
                                      Xem chi tiết
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.messageText}
                                  </span>
                                )}
                              </motion.div>
                              <div className={`text-xs mt-1 px-2 ${
                                isMine ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {formatTime(msg.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area - Floating Style */}
                  <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-5 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                        disabled={sending}
                      />
                      <motion.button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          newMessage.trim() && !sending
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </motion.button>
                    </form>
                  </div>
                </>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center px-8"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-6" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    Chọn một cuộc trò chuyện để bắt đầu
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Bắt đầu trò chuyện với người bán hoặc người mua để trao đổi thông tin về bất động sản
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
