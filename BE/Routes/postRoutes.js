const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateJwt = require('../Middlewares/authJwt');
const { requireSeller, requireBuyer } = require('../middlewares/roleAuth');
const { requireAdminAPI } = require('../middlewares/adminAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Seller routes
router.post('/create', authenticateJwt, requireSeller, upload.array('images', 10), postController.createPost);

// Buyer/Admin routes
router.get('/list', authenticateJwt, postController.getPosts);
router.get('/', authenticateJwt, postController.getPosts);
router.post('/:postId/like', authenticateJwt, postController.toggleLike);
router.post('/:postId/comment', authenticateJwt, postController.addComment);
router.get('/:postId/comments', authenticateJwt, postController.getComments);

// Admin review routes
router.put('/:id/approve', requireAdminAPI, postController.approvePost);
router.put('/:id/reject', requireAdminAPI, postController.rejectPost);

// Seller/Admin delete post
router.delete('/:id', authenticateJwt, postController.deletePost);

module.exports = router;
