const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/chat-images');
        
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
        }
    }
});

class UploadController {
    // Middleware upload
    uploadSingle() {
        return upload.single('image');
    }

    // Upload ảnh cho chat
    async uploadChatImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file được upload'
                });
            }

            // Tạo URL cho ảnh (full URL với protocol và host)
            const protocol = req.protocol;
            const host = req.get('host');
            const imageUrl = `${protocol}://${host}/uploads/chat-images/${req.file.filename}`;

            console.log('✅ Image uploaded successfully:', imageUrl);

            res.json({
                success: true,
                data: {
                    imageUrl: imageUrl,
                    fileName: req.file.originalname,
                    fileSize: req.file.size
                }
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi upload ảnh'
            });
        }
    }
}

module.exports = new UploadController();
