const express = require('express');
const router = express.Router();
const { connection } = require('../mysql');
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Check if property is favorited by user
router.get('/favorites/check/:propertyId', authMiddleware(), async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.userId || req.user.user_id;

        console.log('[Favorites Check] PropertyId:', propertyId, 'UserId:', userId);

        const query = `
            SELECT COUNT(*) as count 
            FROM favorites 
            WHERE user_id = ? AND property_id = ?
        `;

        connection.query(query, [userId, propertyId], (error, results) => {
            if (error) {
                console.error('[Favorites Check] Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi kiểm tra trạng thái yêu thích',
                    error: error.message
                });
            }

            const isFavorited = results[0].count > 0;
            console.log('[Favorites Check] Result:', isFavorited);

            res.json({
                success: true,
                isFavorited: isFavorited
            });
        });
    } catch (error) {
        console.error('[Favorites Check] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra yêu thích',
            error: error.message
        });
    }
});

// Toggle favorite status
router.post('/favorites/toggle', authMiddleware(), async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user.userId || req.user.user_id;

        console.log('[Favorites Toggle] PropertyId:', propertyId, 'UserId:', userId);

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: 'PropertyId là bắt buộc'
            });
        }

        // Check if already favorited
        const checkQuery = `
            SELECT id FROM favorites 
            WHERE user_id = ? AND property_id = ?
        `;

        connection.query(checkQuery, [userId, propertyId], (error, results) => {
            if (error) {
                console.error('[Favorites Toggle] Check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi kiểm tra trạng thái yêu thích',
                    error: error.message
                });
            }

            const isCurrentlyFavorited = results.length > 0;
            console.log('[Favorites Toggle] Currently favorited:', isCurrentlyFavorited);

            if (isCurrentlyFavorited) {
                // Remove from favorites
                const deleteQuery = `
                    DELETE FROM favorites 
                    WHERE user_id = ? AND property_id = ?
                `;

                connection.query(deleteQuery, [userId, propertyId], (deleteError) => {
                    if (deleteError) {
                        console.error('[Favorites Toggle] Delete error:', deleteError);
                        return res.status(500).json({
                            success: false,
                            message: 'Lỗi xóa khỏi yêu thích',
                            error: deleteError.message
                        });
                    }

                    console.log('[Favorites Toggle] Removed from favorites');
                    res.json({
                        success: true,
                        isFavorited: false,
                        message: 'Đã bỏ khỏi yêu thích'
                    });
                });
            } else {
                // Add to favorites
                const insertQuery = `
                    INSERT INTO favorites (user_id, property_id, created_at) 
                    VALUES (?, ?, NOW())
                `;

                connection.query(insertQuery, [userId, propertyId], (insertError) => {
                    if (insertError) {
                        console.error('[Favorites Toggle] Insert error:', insertError);
                        return res.status(500).json({
                            success: false,
                            message: 'Lỗi thêm vào yêu thích',
                            error: insertError.message
                        });
                    }

                    console.log('[Favorites Toggle] Added to favorites');
                    res.json({
                        success: true,
                        isFavorited: true,
                        message: 'Đã thêm vào yêu thích'
                    });
                });
            }
        });
    } catch (error) {
        console.error('[Favorites Toggle] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi toggle yêu thích',
            error: error.message
        });
    }
});

// Get user's favorite properties
router.get('/favorites', authMiddleware(), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;

        console.log('[Favorites List] UserId:', userId);

        const query = `
            SELECT 
                f.id as favorite_id,
                f.created_at as favorited_at,
                h.HouseID,
                h.Title,
                h.Address,
                h.Price,
                h.Bedrooms,
                h.Bathrooms,
                h.Area,
                h.Status,
                h.CreatedAt
            FROM favorites f
            JOIN houses h ON f.property_id = h.HouseID
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;

        connection.query(query, [userId], (error, results) => {
            if (error) {
                console.error('[Favorites List] Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi lấy danh sách yêu thích',
                    error: error.message
                });
            }

            console.log('[Favorites List] Found', results.length, 'favorites');

            res.json({
                success: true,
                data: results,
                count: results.length
            });
        });
    } catch (error) {
        console.error('[Favorites List] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách yêu thích',
            error: error.message
        });
    }
});

module.exports = router;

