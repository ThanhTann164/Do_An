const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./jwt.config');

let io = null;
const userSockets = new Map(); // Map userId to socket.id

function initializeWebSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST']
        }
    });

    // Middleware xác thực JWT (optional cho notifications)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log('⚠️ WebSocket connection without token (guest mode)');
            socket.userId = null;
            socket.userRole = 'guest';
            return next();
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;
            console.log(`✅ WebSocket authenticated: User ${socket.userId} (${socket.userRole})`);
            next();
        } catch (err) {
            console.log('⚠️ WebSocket invalid token, connecting as guest');
            socket.userId = null;
            socket.userRole = 'guest';
            next();
        }
    });

    io.on('connection', (socket) => {
        console.log(`💬 User ${socket.userId || 'guest'} connected via WebSocket (socket: ${socket.id})`);
        
        // Lưu socket của user (chỉ khi có userId)
        if (socket.userId) {
            userSockets.set(socket.userId, socket.id);
            // Tham gia room cá nhân
            socket.join(`user_${socket.userId}`);
        }

        // Xử lý join notifications (cho cả guest và user)
        socket.on('join_notifications', (userId) => {
            if (userId && socket.userId === userId) {
                socket.join(`notifications_${userId}`);
                console.log(`🔔 User ${userId} joined notifications room`);
            }
        });

        // Xử lý join conversation
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`✅ User ${socket.userId} joined conversation ${conversationId}`);
            console.log(`   Rooms: ${Array.from(socket.rooms).join(', ')}`);
        });

        // Xử lý leave conversation
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Xử lý typing indicator
        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping
            });
        });

        // Xử lý disconnect
        socket.on('disconnect', () => {
            console.log(`💬 User ${socket.userId || 'guest'} disconnected`);
            if (socket.userId) {
                userSockets.delete(socket.userId);
            }
        });
    });

    console.log('✅ WebSocket server initialized');
    return io;
}

function getIO() {
    if (!io) {
        throw new Error('WebSocket not initialized');
    }
    return io;
}

// Hàm gửi message realtime
async function emitNewMessage(conversationId, message) {
    if (!io) {
        console.error('❌ WebSocket not initialized, cannot emit message');
        return;
    }

    console.log(`📡 Broadcasting message to conversation_${conversationId}:`, {
        messageId: message.messageId,
        text: message.messageText?.substring(0, 50),
        senderId: message.sender?.userId
    });

    // Broadcast đến tất cả users trong conversation room
    io.to(`conversation_${conversationId}`).emit('new_message', message);

    // Đồng thời gửi trực tiếp đến cả 2 participants (backup)
    // Lấy conversation để biết 2 participants
    try {
        const sequelize = require('../config/sequelize');
        const initModels = require('../models/init-models');
        const { conversations } = initModels(sequelize);
        
        const conv = await conversations.findByPk(conversationId);
        if (conv) {
            // Gửi đến cả 2 participants
            io.to(`user_${conv.Participant1ID}`).emit('new_message', message);
            io.to(`user_${conv.Participant2ID}`).emit('new_message', message);
            console.log(`📤 Sent to users: ${conv.Participant1ID}, ${conv.Participant2ID}`);
        }
    } catch (error) {
        console.error('Error getting conversation participants:', error);
    }
}

// Hàm gửi thông báo cho user cụ thể
function emitToUser(userId, event, data) {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
        io.to(`notifications_${userId}`).emit(event, data);
    }
}

// Hàm gửi thông báo mới
function emitNewNotification(userId, notification) {
    if (io) {
        console.log(`🔔 Sending notification to user ${userId}:`, notification.title);
        io.to(`user_${userId}`).emit('new_notification', notification);
        io.to(`notifications_${userId}`).emit('new_notification', notification);
    }
}

// Hàm broadcast thông báo cho tất cả users
function broadcastNotification(notification) {
    if (io) {
        console.log(`📢 Broadcasting notification: ${notification.title}`);
        io.emit('new_notification', notification);
    }
}

module.exports = {
    initializeWebSocket,
    getIO,
    emitNewMessage,
    emitToUser,
    emitNewNotification,
    broadcastNotification,
    userSockets
};

