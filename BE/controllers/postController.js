const { initModels } = require('../models/init-models');
const { Op } = require('sequelize');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const PackageMiddleware = require('../middlewares/packageMiddleware');
const { isSellerRole, extractRole } = require('../Utils/roleUtils');

const PACKAGE_FORBIDDEN_MESSAGE = 'Bạn không có quyền sử dụng tính năng package';

// Initialize models
const { houses, houseimages, users, comments, iotdevices } = initModels(sequelize);

// Create a new property post
const createPost = async (req, res) => {
    try {
        console.log('🔍 [createPost] Request received:', {
            userId: req.user?.userId,
            body: req.body,
            files: req.files
        });

        const userId = req.user.userId;
        const role = extractRole(req.user);
        if (!isSellerRole(role)) {
            return res.status(403).json({
                success: false,
                message: PACKAGE_FORBIDDEN_MESSAGE
            });
        }
        const {
            title,
            description,
            price,
            propertyType,
            area,
            city,
            district,
            ward,
            address,
            latitude,
            longitude,
            bedrooms,
            bathrooms,
            floors,
            yearBuilt,
            amenities,
            contactName,
            contactPhone,
            contactEmail,
            iotDevices
        } = req.body;

        console.log('🔍 [createPost] Extracted data:', {
            title, price, propertyType, city, district, ward, address, contactName, contactPhone
        });

        // Validate required fields
        if (!title || !price || !propertyType || !address) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: tiêu đề, giá, loại bất động sản, địa chỉ'
            });
        }

        // Check package limits
        const userPackage = await PackageMiddleware.getUserPackage(userId, role);
        if (!userPackage) {
            return res.status(500).json({
                success: false,
                message: 'Không thể kiểm tra gói dịch vụ'
            });
        }

        const rules = userPackage.rules;
        
        // Check daily post limit
        if (rules.max_posts_per_day > 0 && userPackage.posts_today >= rules.max_posts_per_day) {
            return res.status(403).json({
                success: false,
                message: `Bạn cần nâng cấp gói để đăng thêm tin`,
                data: {
                    posts_today: userPackage.posts_today,
                    max_posts_per_day: rules.max_posts_per_day,
                    current_package: userPackage.package_name
                },
                upgrade_suggestion: userPackage.package_name === 'FREE' ? 
                    'Nâng cấp lên gói PRO để đăng 5 bài/ngày' : 
                    'Nâng cấp lên gói PREMIUM để đăng 20 bài/ngày'
            });
        }

        // Check monthly post limit
        if (rules.max_posts_per_month > 0 && userPackage.posts_this_month >= rules.max_posts_per_month) {
            return res.status(403).json({
                success: false,
                message: `Bạn đã đạt giới hạn ${rules.max_posts_per_month} bài đăng/tháng của gói ${userPackage.package_name}`,
                data: {
                    posts_this_month: userPackage.posts_this_month,
                    max_posts_per_month: rules.max_posts_per_month,
                    current_package: userPackage.package_name
                },
                upgrade_suggestion: userPackage.package_name === 'FREE' ? 
                    'Nâng cấp lên gói PRO để đăng tối đa 20 bài/tháng' : 
                    'Nâng cấp lên gói PREMIUM để đăng không giới hạn'
            });
        }

        // Create the house record (mặc định chờ duyệt)
        const house = await houses.create({
            OwnerID: userId,
            Title: title,
            Description: description,
            Price: parseFloat(price),
            HouseType: propertyType,
            Address: `${address}, ${ward}, ${district}, ${city}`,
            Status: 'Pending'
        });

        console.log('✅ [createPost] House created:', house.HouseID);

        // Xử lý IoT devices nếu có
        if (iotDevices) {
            try {
                const parsedIoTDevices = typeof iotDevices === 'string' ? JSON.parse(iotDevices) : iotDevices;
                console.log('🔍 [createPost] IoT devices to create:', parsedIoTDevices);
                
                if (Array.isArray(parsedIoTDevices) && parsedIoTDevices.length > 0) {
                    for (const device of parsedIoTDevices) {
                        await iotdevices.create({
                            HouseID: house.HouseID,
                            DeviceName: device.name,
                            DeviceType: device.type,
                            Status: 'Active'
                        });
                    }
                    console.log('✅ [createPost] IoT devices created successfully');
                }
            } catch (iotError) {
                console.error('❌ [createPost] Error creating IoT devices:', iotError);
                // Không fail toàn bộ request nếu IoT devices tạo lỗi
            }
        }

        // Handle images if provided
        if (req.files && req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

            for (let image of images) {
                await houseimages.create({
                    HouseID: house.HouseID,
                    // Lưu đường dẫn đầy đủ vào CloudPath và tên file vào FileName
                    CloudPath: `/uploads/${image.filename}`,
                    FileName: image.filename,
                    IsCover: false
                });
            }
            console.log('✅ [createPost] Images processed:', images.length);
        } else {
            console.log('ℹ️ [createPost] No images provided');
        }

        res.json({
            success: true,
            message: 'Bài đăng đã được tạo thành công!',
            data: {
                houseId: house.HouseID,
                title: house.Title,
                price: house.Price
            }
        });

    } catch (error) {
        console.error('❌ [createPost] Error creating post:', error);
        console.error('❌ [createPost] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo bài đăng',
            error: error.message
        });
    }
};

// Get all posts for buyers
const getPosts = async (req, res) => {
    try {
        console.log('🔍 [getPosts] Request received:', req.query);
        
        const {
            propertyType,
            city,
            priceFrom,
            priceTo,
            status,
            keyword,
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause
        const whereClause = {};
        // Admin có thể xem theo bộ lọc status
        // Seller xem bài đăng của chính mình (tất cả trạng thái)
        // Buyer chỉ xem Available
        if (req.user && req.user.role === 'Admin') {
            if (status) whereClause.Status = status;
        } else if (req.user && req.user.role === 'Seller') {
            // Seller chỉ xem bài đăng của chính mình
            whereClause.OwnerID = req.user.userId;
        } else {
            // Buyer chỉ xem bài đăng Available
            whereClause.Status = 'Available';
        }

        if (propertyType) {
            whereClause.HouseType = propertyType;
        }

        if (city) {
            whereClause.Address = {
                [Op.like]: `%${city}%`
            };
        }

        if (keyword) {
            whereClause.Title = { [Op.like]: `%${keyword}%` };
        }

        if (priceFrom || priceTo) {
            whereClause.Price = {};
            if (priceFrom) whereClause.Price[Op.gte] = parseFloat(priceFrom);
            if (priceTo) whereClause.Price[Op.lte] = parseFloat(priceTo);
        }

        // Get posts with pagination
        const offset = (page - 1) * limit;
        
        const posts = await houses.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['UserID', 'FullName', 'Email']
                },
                {
                    model: houseimages,
                    as: 'houseimages',
                    attributes: ['CloudPath', 'FileName', 'IsCover']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // Format posts for frontend (include both formats for compatibility)
        const formattedPosts = posts.rows.map(post => ({
            // Original DB fields (PascalCase) - for backward compatibility
            HouseID: post.HouseID,
            Title: post.Title,
            Description: post.Description,
            Price: post.Price,
            HouseType: post.HouseType,
            Address: post.Address,
            Status: post.Status,
            CreatedAt: post.createdAt,
            OwnerID: post.OwnerID,
            // Formatted fields (camelCase) - new standard
            id: post.HouseID,
            title: post.Title,
            description: post.Description,
            price: post.Price,
            propertyType: post.HouseType,
            address: post.Address,
            status: post.Status,
            createdAt: post.createdAt,
            sellerId: post.Owner?.UserID || post.OwnerID,
            seller: {
                name: post.Owner?.FullName || 'Người bán',
                email: post.Owner?.Email || '',
                avatar: post.Owner?.FullName ? post.Owner.FullName.charAt(0).toUpperCase() : 'S'
            },
            images: post.houseimages?.map(img => img.CloudPath || img.FileName) || ['/images/img_1.jpg'],
            likes: 0,
            comments: 0,
            isLiked: false
        }));

        res.json({
            success: true,
            data: {
                posts: formattedPosts,
                total: posts.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(posts.count / limit)
            }
        });

    } catch (error) {
        console.error('❌ [getPosts] Error getting posts:', error);
        console.error('❌ [getPosts] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách bài đăng',
            error: error.message
        });
    }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // For now, just return success
        // In real implementation, you would have a likes table
        res.json({
            success: true,
            message: 'Like status updated',
            isLiked: true
        });

    } catch (error) {
        console.error('❌ [toggleLike] Error toggling like:', error);
        console.error('❌ [toggleLike] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật like',
            error: error.message
        });
    }
};

// Add comment to a post
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;

        // Create comment
        const comment = await comments.create({
            HouseID: postId,
            UserID: userId,
            CommentText: text,
            Status: 'Active'
        });

        // Get user info for response
        const user = await users.findByPk(userId, {
            attributes: ['FullName', 'Email']
        });

        res.json({
            success: true,
            message: 'Bình luận đã được thêm',
            data: {
                id: comment.CommentID,
                text: comment.CommentText,
                author: user.FullName || user.Email,
                avatar: user.FullName ? user.FullName.charAt(0).toUpperCase() : 'U',
                createdAt: comment.createdAt
            }
        });

    } catch (error) {
        console.error('❌ [addComment] Error adding comment:', error);
        console.error('❌ [addComment] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thêm bình luận',
            error: error.message
        });
    }
};

// Get comments for a post
const getComments = async (req, res) => {
    try {
        console.log('🔍 [getComments] Request received:', req.params);
        
        const { postId } = req.params;

        const commentsList = await comments.findAll({
            where: {
                HouseID: postId,
                Status: 'Active'
            },
            include: [
                {
                    model: users,
                    as: 'User',
                    attributes: ['FullName', 'Email']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        const formattedComments = commentsList.map(comment => ({
            id: comment.CommentID,
            text: comment.CommentText,
            author: comment.User?.FullName || comment.User?.Email || 'Người dùng',
            avatar: comment.User?.FullName ? comment.User.FullName.charAt(0).toUpperCase() : 'U',
            createdAt: comment.createdAt
        }));

        res.json({
            success: true,
            data: formattedComments
        });

    } catch (error) {
        console.error('❌ [getComments] Error getting comments:', error);
        console.error('❌ [getComments] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy bình luận',
            error: error.message
        });
    }
};

// Admin: approve a post
const approvePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await houses.findByPk(id);
        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
        await post.update({ Status: 'Available' });
        return res.json({ success: true, message: 'Đã duyệt bài đăng', data: { id: post.HouseID, status: post.Status } });
    } catch (error) {
        console.error('❌ [approvePost] Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi duyệt bài' });
    }
};

// Admin: reject a post
const rejectPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await houses.findByPk(id);
        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
        await post.update({ Status: 'Rejected' });
        return res.json({ success: true, message: 'Đã từ chối bài đăng', data: { id: post.HouseID, status: post.Status } });
    } catch (error) {
        console.error('❌ [rejectPost] Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi từ chối bài' });
    }
};

// Admin: Get all posts pending approval
const getPendingPosts = async (req, res) => {
    try {
        console.log('🔍 [getPendingPosts] Admin checking pending posts');
        
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const posts = await houses.findAndCountAll({
            where: {
                Status: 'Pending'
            },
            include: [
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
                },
                {
                    model: houseimages,
                    as: 'houseimages',
                    attributes: ['CloudPath', 'FileName', 'IsCover']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        const formattedPosts = posts.rows.map(post => ({
            // Original DB fields (PascalCase)
            HouseID: post.HouseID,
            Title: post.Title,
            Description: post.Description,
            Price: post.Price,
            HouseType: post.HouseType,
            Address: post.Address,
            Status: post.Status,
            CreatedAt: post.createdAt,
            OwnerID: post.OwnerID,
            // Formatted fields (camelCase)
            id: post.HouseID,
            title: post.Title,
            description: post.Description,
            price: post.Price,
            propertyType: post.HouseType,
            address: post.Address,
            status: post.Status,
            createdAt: post.createdAt,
            sellerId: post.Owner?.UserID || post.OwnerID,
            seller: {
                id: post.Owner?.UserID,
                name: post.Owner?.FullName || 'Người bán',
                email: post.Owner?.Email || '',
                phone: post.Owner?.PhoneNumber || '',
                avatar: post.Owner?.FullName ? post.Owner.FullName.charAt(0).toUpperCase() : 'S'
            },
            images: post.houseimages?.map(img => img.CloudPath || img.FileName) || []
        }));

        res.json({
            success: true,
            message: `Có ${posts.count} bài đăng đang chờ duyệt`,
            data: {
                posts: formattedPosts,
                total: posts.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(posts.count / limit)
            }
        });

    } catch (error) {
        console.error('❌ [getPendingPosts] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách bài chờ duyệt',
            error: error.message
        });
    }
};

// Admin: Get all posts with status filter
const getAllPostsAdmin = async (req, res) => {
    try {
        console.log('🔍 [getAllPostsAdmin] Admin viewing all posts');
        
        const {
            status,
            propertyType,
            city,
            priceFrom,
            priceTo,
            keyword,
            page = 1,
            limit = 10
        } = req.query;

        // Build where clause
        const whereClause = {};
        
        if (status) {
            whereClause.Status = status;
        }
        
        if (propertyType) {
            whereClause.HouseType = propertyType;
        }

        if (city) {
            whereClause.Address = {
                [Op.like]: `%${city}%`
            };
        }

        if (keyword) {
            whereClause.Title = { [Op.like]: `%${keyword}%` };
        }

        if (priceFrom || priceTo) {
            whereClause.Price = {};
            if (priceFrom) whereClause.Price[Op.gte] = parseFloat(priceFrom);
            if (priceTo) whereClause.Price[Op.lte] = parseFloat(priceTo);
        }

        const offset = (page - 1) * limit;
        
        const posts = await houses.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: users,
                    as: 'Owner',
                    attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
                },
                {
                    model: houseimages,
                    as: 'houseimages',
                    attributes: ['CloudPath', 'FileName', 'IsCover']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        const formattedPosts = posts.rows.map(post => ({
            // Original DB fields (PascalCase)
            HouseID: post.HouseID,
            Title: post.Title,
            Description: post.Description,
            Price: post.Price,
            HouseType: post.HouseType,
            Address: post.Address,
            Status: post.Status,
            CreatedAt: post.createdAt,
            OwnerID: post.OwnerID,
            // Formatted fields (camelCase)
            id: post.HouseID,
            title: post.Title,
            description: post.Description,
            price: post.Price,
            propertyType: post.HouseType,
            address: post.Address,
            status: post.Status,
            createdAt: post.createdAt,
            sellerId: post.Owner?.UserID || post.OwnerID,
            seller: {
                id: post.Owner?.UserID,
                name: post.Owner?.FullName || 'Người bán',
                email: post.Owner?.Email || '',
                phone: post.Owner?.PhoneNumber || '',
                avatar: post.Owner?.FullName ? post.Owner.FullName.charAt(0).toUpperCase() : 'S'
            },
            images: post.houseimages?.map(img => img.CloudPath || img.FileName) || []
        }));

        res.json({
            success: true,
            data: {
                posts: formattedPosts,
                total: posts.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(posts.count / limit)
            }
        });

    } catch (error) {
        console.error('❌ [getAllPostsAdmin] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách bài đăng',
            error: error.message
        });
    }
};

// Admin: Get post statistics
const getPostStats = async (req, res) => {
    try {
        console.log('🔍 [getPostStats] Getting post statistics');

        const [pending, available, rejected, sold] = await Promise.all([
            houses.count({ where: { Status: 'Pending' } }),
            houses.count({ where: { Status: 'Available' } }),
            houses.count({ where: { Status: 'Rejected' } }),
            houses.count({ where: { Status: 'Sold' } })
        ]);

        const total = pending + available + rejected + sold;

        res.json({
            success: true,
            data: {
                total,
                pending,
                available,
                rejected,
                sold
            }
        });

    } catch (error) {
        console.error('❌ [getPostStats] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thống kê bài đăng',
            error: error.message
        });
    }
};

// Seller/Admin: delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const authUserId = req.user?.userId;
        const authRole = req.user?.role;

        const post = await houses.findByPk(id);
        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });

        // Only owner (Seller) or Admin can delete
        if (authRole !== 'Admin' && String(post.OwnerID) !== String(authUserId)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài này' });
        }

        await post.destroy();
        return res.json({ success: true, message: 'Đã xóa bài đăng', data: { id: Number(id) } });
    } catch (error) {
        console.error('❌ [deletePost] Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi xóa bài' });
    }
};

module.exports = {
    createPost,
    getPosts,
    toggleLike,
    addComment,
    getComments,
    approvePost,
    rejectPost,
    deletePost,
    getPendingPosts,
    getAllPostsAdmin,
    getPostStats
};
