const chatRepository = require('../Repositories/chat.repository');
const { emitNewMessage, emitToUser } = require('../Config/websocket');

class ChatService {
    // Lấy danh sách conversations
    async getUserConversations(userId) {
        try {
            return await chatRepository.getUserConversations(userId);
        } catch (error) {
            console.error('Error in getUserConversations service:', error);
            throw new Error('Không thể lấy danh sách hội thoại');
        }
    }

    // Bắt đầu conversation mới hoặc lấy conversation hiện có
    async startConversation(userId, targetUserId) {
        try {
            if (userId === targetUserId) {
                throw new Error('Không thể tạo hội thoại với chính mình');
            }

            const conversation = await chatRepository.findOrCreateConversation(userId, targetUserId);
            
            // Lấy thông tin của target user
            const messages = await chatRepository.getConversationMessages(conversation.ConversationID, userId, 1);
            
            return {
                conversationId: conversation.ConversationID,
                messages: []
            };
        } catch (error) {
            console.error('Error in startConversation service:', error);
            throw new Error('Không thể bắt đầu hội thoại');
        }
    }

    // Gửi message
    async sendMessage(userId, conversationId, messageText, messageType = 'text', metadata = null) {
        try {
            if (!messageText || messageText.trim() === '') {
                throw new Error('Tin nhắn không được để trống');
            }

            const message = await chatRepository.createMessage(
                conversationId, 
                userId, 
                messageText.trim(),
                messageType,
                metadata
            );

            console.log('📤 Emitting message via WebSocket:', {
                conversationId,
                messageId: message.messageId,
                type: messageType,
                text: message.messageText
            });

            // Emit message qua WebSocket
            emitNewMessage(conversationId, message);

            return message;
        } catch (error) {
            console.error('Error in sendMessage service:', error);
            throw new Error('Không thể gửi tin nhắn');
        }
    }

    // Lấy messages trong conversation
    async getMessages(conversationId, userId, limit = 50, offset = 0) {
        try {
            const messages = await chatRepository.getConversationMessages(
                conversationId, 
                userId, 
                limit, 
                offset
            );

            // Đánh dấu đã đọc
            await chatRepository.markMessagesAsRead(conversationId, userId);

            return messages;
        } catch (error) {
            console.error('Error in getMessages service:', error);
            throw new Error('Không thể lấy tin nhắn');
        }
    }

    // Đánh dấu đã đọc
    async markAsRead(conversationId, userId) {
        try {
            await chatRepository.markMessagesAsRead(conversationId, userId);
            
            // Emit event đã đọc
            emitToUser(userId, 'messages_read', { conversationId });
            
            return true;
        } catch (error) {
            console.error('Error in markAsRead service:', error);
            throw new Error('Không thể đánh dấu đã đọc');
        }
    }

    // Lấy số tin chưa đọc
    async getUnreadCount(userId) {
        try {
            return await chatRepository.getUnreadCount(userId);
        } catch (error) {
            console.error('Error in getUnreadCount service:', error);
            throw new Error('Không thể lấy số tin chưa đọc');
        }
    }

    // Lấy danh sách users có thể chat (Admin, Seller cho Buyer)
    async getAvailableUsers(userId, userRole) {
        try {
            let availableUsers = [];

            if (userRole === 'Buyer') {
                // Buyer có thể chat với Admin và Seller
                const admins = await chatRepository.getUsersByRole('Admin');
                const sellers = await chatRepository.getUsersByRole('Seller');
                availableUsers = [...admins, ...sellers];
            } else if (userRole === 'Seller') {
                // Seller có thể chat với Admin và Buyer
                const admins = await chatRepository.getUsersByRole('Admin');
                const buyers = await chatRepository.getUsersByRole('Buyer');
                availableUsers = [...admins, ...buyers];
            } else if (userRole === 'Admin') {
                // Admin có thể chat với tất cả
                const sellers = await chatRepository.getUsersByRole('Seller');
                const buyers = await chatRepository.getUsersByRole('Buyer');
                availableUsers = [...sellers, ...buyers];
            }

            // Lọc bỏ chính user hiện tại
            return availableUsers.filter(u => u.UserID !== userId);
        } catch (error) {
            console.error('Error in getAvailableUsers service:', error);
            throw new Error('Không thể lấy danh sách người dùng');
        }
    }
}

module.exports = new ChatService();

