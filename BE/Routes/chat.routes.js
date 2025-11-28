const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const uploadController = require('../controllers/upload.controller');
const verifyJWT = require('../Middlewares/authJwt');

// Middleware để parse userId từ JWT
const parseUserFromJWT = (req, res, next) => {
    verifyJWT(req, res, (err) => {
        if (err) return next(err);
        req.userId = req.user?.userId || req.user?.id;
        req.userRole = req.user?.role;
        next();
    });
};

// Tất cả routes đều cần authentication
router.use(parseUserFromJWT);

// GET /api/chat/conversations - Lấy danh sách conversations
router.get('/conversations', chatController.getConversations);

// POST /api/chat/conversations - Bắt đầu conversation mới
router.post('/conversations', chatController.startConversation);

// GET /api/chat/messages/:conversationId - Lấy messages
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/messages - Gửi message
router.post('/messages', chatController.sendMessage);

// PUT /api/chat/mark-read - Đánh dấu đã đọc
router.put('/mark-read', chatController.markAsRead);

// GET /api/chat/unread-count - Lấy số tin chưa đọc
router.get('/unread-count', chatController.getUnreadCount);

// GET /api/chat/available-users - Lấy danh sách users có thể chat
router.get('/available-users', chatController.getAvailableUsers);

// POST /api/chat/upload-image - Upload ảnh cho chat
router.post('/upload-image', uploadController.uploadSingle(), uploadController.uploadChatImage);

module.exports = router;

