const chatService = require('../Services/chat.service');

class ChatController {
    // Lấy danh sách conversations
    async getConversations(req, res) {
        try {
            const userId = req.userId;
            const conversations = await chatService.getUserConversations(userId);
            
            res.json({
                success: true,
                data: conversations
            });
        } catch (error) {
            console.error('Error in getConversations:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Bắt đầu conversation mới
    async startConversation(req, res) {
        try {
            const userId = req.userId;
            const { targetUserId } = req.body;

            if (!targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin người nhận'
                });
            }

            const conversation = await chatService.startConversation(userId, parseInt(targetUserId));
            
            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error('Error in startConversation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Gửi message
    async sendMessage(req, res) {
        try {
            const userId = req.userId;
            const { conversationId, messageText, messageType, metadata } = req.body;

            if (!conversationId || !messageText) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin tin nhắn'
                });
            }

            const message = await chatService.sendMessage(
                userId, 
                parseInt(conversationId), 
                messageText,
                messageType || 'text',
                metadata || null
            );
            
            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error in sendMessage:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Lấy messages
    async getMessages(req, res) {
        try {
            const userId = req.userId;
            const { conversationId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;

            if (!conversationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID hội thoại'
                });
            }

            const messages = await chatService.getMessages(
                parseInt(conversationId), 
                userId, 
                limit, 
                offset
            );
            
            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error in getMessages:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Đánh dấu đã đọc
    async markAsRead(req, res) {
        try {
            const userId = req.userId;
            const { conversationId } = req.body;

            if (!conversationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID hội thoại'
                });
            }

            await chatService.markAsRead(parseInt(conversationId), userId);
            
            res.json({
                success: true,
                message: 'Đã đánh dấu đã đọc'
            });
        } catch (error) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Lấy số tin chưa đọc
    async getUnreadCount(req, res) {
        try {
            const userId = req.userId;
            const count = await chatService.getUnreadCount(userId);
            
            res.json({
                success: true,
                data: { unreadCount: count }
            });
        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    // Lấy danh sách users có thể chat
    async getAvailableUsers(req, res) {
        try {
            const userId = req.userId;
            const userRole = req.userRole || req.role;

            const users = await chatService.getAvailableUsers(userId, userRole);
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error in getAvailableUsers:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }
}

module.exports = new ChatController();

