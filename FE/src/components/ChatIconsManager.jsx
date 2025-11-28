import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import websocketService from '../services/websocket';
import { chatAPI } from '../services/chat.api';
import ChatBox from './ChatBox';
import './ChatIcon.css';

export default function ChatIconsManager() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [openChats, setOpenChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState(new Set());

  useEffect(() => {
    loadUnreadCount();

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (message) => {
      console.log('📨 [ChatIconsManager] New message:', message);
      
      // Cập nhật unread count
      loadUnreadCount();

      // Lấy current user ID
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

      // Kiểm tra xem tin nhắn có phải của mình không
      const messageSenderId = message.senderId || message.sender?.userId;
      if (currentUserId && messageSenderId == currentUserId) {
        console.log('⏭️ [ChatIconsManager] Skipping own message');
        return;
      }

      // Tự động mở chat nếu chưa mở
      const convId = message.conversationId || message.ConversationID;
      const isOpen = openChats.some(chat => chat.conversationId === convId);
      
      if (!isOpen && message.sender) {
        console.log('📂 [ChatIconsManager] Opening new chat with:', message.sender.fullName);
        
        // Mở chat mới với người gửi
        const newChat = {
          conversationId: convId,
          targetUser: {
            userId: message.sender.userId || message.sender.UserID,
            fullName: message.sender.fullName || message.sender.FullName,
            role: message.sender.role || message.sender.Role
          }
        };
        setOpenChats(prev => [...prev, newChat]);
        
        // Đảm bảo chat không bị minimize
        setMinimizedChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(convId);
          return newSet;
        });
      } else if (isOpen) {
        // Nếu đã mở nhưng bị minimize, thì mở lại
        setMinimizedChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(convId);
          return newSet;
        });
      }
    };

    websocketService.on('new_message', handleNewMessage);

    return () => {
      websocketService.off('new_message', handleNewMessage);
    };
  }, [openChats]);

  const loadUnreadCount = async () => {
    try {
      const result = await chatAPI.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const toggleMinimize = (conversationId) => {
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const closeChat = (conversationId) => {
    setOpenChats(prev => prev.filter(chat => chat.conversationId !== conversationId));
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
  };

  return (
    <>
      {/* Open chat boxes */}
      {openChats.map((chat) => {
        const isMinimized = minimizedChats.has(chat.conversationId);
        
        if (isMinimized) return null;
        
        return (
          <ChatBox 
            key={chat.conversationId}
            targetUser={chat.targetUser}
            onClose={() => closeChat(chat.conversationId)}
          />
        );
      })}

      {/* Chat icon button */}
      <div className="chat-icon-container">
        <Link to="/chat">
          <button className="chat-icon-button" title="Mở trang Chat">
            <i className="fas fa-comments"></i>
            {unreadCount > 0 && (
              <span className="chat-icon-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
        </Link>
      </div>
    </>
  );
}
