// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const cookieParser = require('cookie-parser');
const http = require('http');
const { JWT_SECRET } = require('./Config/jwt.config');

// // Import database setup (match exact casing with file name)
// const { createUsersTable } = require('./config/tableSetup');
const getSequelizeInstance = require('./utils/sequelize-instance');
const sequelize = getSequelizeInstance();

// Import database connection for legacy queries
const { connection } = require('./mysql');


// Routes
const authRoutes = require('./Routes/authRoutes');
const googleAuthRoutes = require('./Routes/googleauthroutes');
// const viewRoutes = require('./routes/viewroutes'); // DISABLED: Chuyển sang React SPA
const houseRoutes = require("./Routes/house.routes");
const userRoutes = require('./Routes/userRoutes');
const requestRoutes = require("./Routes/request.routes");
const sellerUpgradeRoutes = require("./Routes/sellerUpgrade.routes");
const chatRoutes = require('./Routes/chat.routes');
const appointmentRoutes = require('./Routes/appointment.routes');
const bookingRoutes = require('./Routes/booking.routes');
const viewingRoutes = require('./Routes/viewing.routes');
const healthRoutes = require('./Routes/healthRoutes');
const momoPaymentRoutes = require('./Routes/momoPaymentRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const sellerDashboardRoutes = require('./Routes/sellerDashboardRoutes');
const favoriteRoutes = require('./Routes/favoriteRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');

// Import role-based routes
const adminRoutes = require('./Routes/adminRoutes');
const sellerRoutes = require('./Routes/sellerRoutes');
const buyerRoutes = require('./Routes/buyerRoutes');
const postRoutes = require('./Routes/postRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'https://accounts.google.com', 'https://accounts.google.com.vn'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
// Serve React build
const reactBuildPath = path.join(__dirname, '../FE/dist');

if (fs.existsSync(reactBuildPath)) {
    console.log('📦 Serving React app from:', reactBuildPath);
    app.use(express.static(reactBuildPath));
} else {
    console.log('⚠️  Warning: React build not found. Please run "npm run build" in FE folder.');
    console.log('📦 Expected build path:', reactBuildPath);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const avatarPath = path.join(__dirname, "uploads", "avatars");
if (!fs.existsSync(avatarPath)) {
    fs.mkdirSync(avatarPath, { recursive: true });
    console.log('📁 Created avatars directory:', avatarPath);
}

// ========== ROUTES ==========
// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API working!' });
});

// Test POST route
app.post('/api/test-post', (req, res) => {
    res.json({ success: true, message: 'POST API working!', body: req.body });
});

// ========== HEALTH CHECK ROUTE ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== API ROUTES (Không cần authentication) ==========
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // Add this for frontend compatibility
app.use("/api/houses", houseRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/seller-upgrade", sellerUpgradeRoutes);
// API cung cấp thông tin user từ JWT cookie/header để FE hiển thị (đặt TRƯỚC role-based routes)
const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');

app.get('/api/user', async (req, res) => {
    const authHeader = req.headers['authorization'] || req.get('Authorization');
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = bearer || (req.cookies && req.cookies.token);
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        console.error('[/api/user] JWT verify error:', e.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = payload.userId;

    try {
        // Lấy thông tin mới nhất từ DB để phản ánh các cập nhật (email/phone...)
        const rows = await connection.query(
            'SELECT UserID, FullName, Email, PhoneNumber, AvatarUrl, Gender, Address, Timezone, Website, Bio, Role, Status FROM users WHERE UserID = ? LIMIT 1',
            {
                replacements: [userId],
                type: QueryTypes.SELECT
            }
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('✅ [/api/user] Raw database row:', row);
        console.log('✅ [/api/user] AvatarUrl from DB:', row.AvatarUrl);
        
        const freshUser = {
            userId: row.UserID,
            id: row.UserID,
            email: row.Email,
            phone: row.PhoneNumber,
            avatarUrl: row.AvatarUrl,
            gender: row.Gender,
            address: row.Address,
            timezone: row.Timezone,
            website: row.Website,
            bio: row.Bio,
            role: row.Role,
            status: row.Status,
            display_name: row.FullName,
            fullName: row.FullName,
            username: row.Email
        };

        // Add cache-busting timestamp to avatar URL
        if (freshUser.avatarUrl) {
            freshUser.avatarUrl = `${freshUser.avatarUrl}?t=${Date.now()}`;
        }

        console.log('✅ [/api/user] Returning user data:', {
            userId: freshUser.userId,
            fullName: freshUser.fullName,
            role: freshUser.role,
            email: freshUser.email,
            avatarUrl: freshUser.avatarUrl
        });

        res.json({ success: true, user: freshUser, data: freshUser });
    } catch (err) {
        console.error('[/api/user] Database query error:', err);
        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
});

// ========== BACKWARD COMPATIBILITY ROUTES ==========
// Để FE cũ vẫn hoạt động, mount authRoutes ở cả root path
// Điều này cho phép cả /auth VÀ /api/auth đều hoạt động
app.use('/', authRoutes);

// Mount Google Auth routes ở cả root và /api
app.use('/', googleAuthRoutes);  // Cho FE cũ: /api/google-config
app.use('/api/google', googleAuthRoutes);  // Cho FE: /api/google/config

// ========== VIEW ROUTES (Cần authentication) ==========
// DISABLED: Đã chuyển sang React SPA, không cần viewRoutes nữa
// app.use('/', viewRoutes);

// Use admin view routes (UI)
// DISABLED: Đã chuyển sang React SPA
// const adminViewRoutes = require('./routes/adminViewRoutes');
// app.use('/', adminViewRoutes);

// Use role-based API routes - THỨ TỰ QUAN TRỌNG!
app.use('/api/notifications', notificationRoutes); // Notification routes: /api/notifications/* - ĐẶT TRƯỚC
app.use('/api', adminRoutes);   // Admin routes: /api/admin/*
app.use('/api', sellerRoutes);  // Seller routes: /api/seller/*
app.use('/api', buyerRoutes);   // Buyer routes: /api/buyer/*
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes); // Chat routes: /api/chat/*
app.use('/api/appointments', appointmentRoutes); // Appointment routes: /api/appointments/*
app.use('/api/bookings', bookingRoutes); // Booking routes: /api/bookings/*
app.use('/', viewingRoutes); // Viewing routes: /api/viewings/*
app.use('/health', healthRoutes); // Health check routes: /health/*
app.use('/api/payment/momo', momoPaymentRoutes); // MoMo payment routes: /api/payment/momo/*
app.use('/api/payments', paymentRoutes); // Unified payment routes: /api/payments/*
app.use('/api/seller', sellerDashboardRoutes); // Seller dashboard routes: /api/seller/*
const sellerStatsRoutes = require('./Routes/sellerStatsRoutes');
app.use('/api/seller', sellerStatsRoutes); // Seller stats routes: /api/seller/stats
app.use('/api', favoriteRoutes); // Favorite routes: /api/favorites/*

// Package and AI routes
const packageRoutes = require('./Routes/packageRoutes');
const aiRoutes = require('./Routes/aiRoutes');
const boostRoutes = require('./Routes/boostRoutes');
const devRoutes = require('./Routes/devRoutes');

app.use('/api/packages', packageRoutes); // Package routes: /api/packages/*
app.use('/api/ai', aiRoutes); // AI routes: /api/ai/*
app.use('/api', boostRoutes); // Boost routes: /api/houses/:id/boost
app.use('/api/dev', devRoutes); // Dev routes: /api/dev/* (development only)

// ========== SPA FALLBACK (phải đặt cuối cùng) ==========
// Với React SPA, tất cả routes không phải API sẽ trả về index.html
// để React Router xử lý client-side routing
app.get('*', (req, res, next) => {
    // Không áp dụng cho API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    
    // Serve React SPA index.html cho tất cả routes không phải API
    if (fs.existsSync(reactBuildPath)) {
        res.sendFile(path.join(reactBuildPath, 'index.html'));
    } else {
        res.status(503).send('React app not built. Please run "npm run build" in FE folder.');
    }
});

// ========== DATABASE TABLE SETUP ==========
// Initialize database tables
// createUsersTable();

// Setup database connection for app.locals
app.locals.db = {
    query: async (sql, params = []) => {
        try {
            const sqlUpper = sql.trim().toUpperCase();
            
            // For SELECT queries
            if (sqlUpper.startsWith('SELECT')) {
                const results = await connection.query(sql, {
                    replacements: params,
                    type: QueryTypes.SELECT
                });
                return results;
            }
            
            // For INSERT, UPDATE, DELETE queries
            const [result, metadata] = await connection.query(sql, {
                replacements: params
            });
            
            // Return result in format similar to mysql2
            return result;
        } catch (err) {
            console.error('❌ Database query error:', err);
            console.error('   SQL:', sql);
            console.error('   Params:', params);
            throw err;
        }
    }
};

// // Create default admin user if not exists
// const createDefaultAdmin = async () => {
//     try {
//         const bcrypt = require('bcryptjs');
        
//         // Check if admin user already exists
//         const existingAdmin = await app.locals.db.query(
//             'SELECT UserID FROM users WHERE Role = ? LIMIT 1', 
//             ['Admin']
//         );
        
//         if (existingAdmin.length === 0) {
//             console.log('📝 Creating default admin user...');
            
//             const adminPassword = 'Admin@123';
//             const hashedPassword = await bcrypt.hash(adminPassword, 12);
            
//             await app.locals.db.query(`
//                 INSERT INTO users (FullName, Email, PhoneNumber, PasswordHash, Role, Status) 
//                 VALUES (?, ?, ?, ?, ?, ?)
//             `, [
//                 'Người dùng Quản trị',
//                 'admin@smarthome.com', 
//                 '0123456789',
//                 hashedPassword,
//                 'Admin',
//                 'Active'
//             ]);
            
//             console.log('✅ Default admin user created successfully!');
//             console.log('📋 Admin credentials:');
//             console.log('   Email: admin@smarthome.com');
//             console.log('   Password: Admin@123');
//         }
//     } catch (error) {
//         console.error('❌ Error creating default admin user:', error);
//     }
// };

// // Create admin user after a short delay to ensure table is created
// setTimeout(createDefaultAdmin, 1000);

// ========== WEBSOCKET SETUP ==========
const { initializeWebSocket } = require('./Config/websocket');
initializeWebSocket(server);

// ========== CRON JOBS SETUP ==========
// const CronJobs = require('./scripts/cronJobs'); // Tạm thời disable
// CronJobs.init(); // Tạm thời disable

// ========== ERROR HANDLERS ==========
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION!');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  // Log but don't exit - let server continue running
  // In production, you might want to restart gracefully
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION!');
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Error name:', reason.name);
    console.error('Error message:', reason.message);
    console.error('Error stack:', reason.stack);
  }
  // Log but don't exit - let server continue running
});

// ========== SERVER STARTUP ==========
const PORT = process.env.PORT || 3001; // Fixed: Should be 3001, not 3000

server.listen(PORT, function() {
    console.log('🏠 Real Estate Server with MVC Architecture');
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`💬 WebSocket server ready for realtime chat`);
    console.log('');
    console.log('🔒 Password Security Features:');
    console.log('   ✅ Minimum 8 characters');
    console.log('   ✅ Must contain uppercase letters (A-Z)');
    console.log('   ✅ Must contain lowercase letters (a-z)');
    console.log('   ✅ Must contain at least 1 number (0-9)');
    console.log('');
    console.log('📄 Available Routes:');
    console.log(`   🏠 Homepage (after login): http://localhost:${PORT}/`);
    console.log(`   📝 Post (Seller only):     http://localhost:${PORT}/post`);
    console.log(`   📰 Posts (Buyer only):     http://localhost:${PORT}/posts`);
    console.log(`   🏘️  Properties:            http://localhost:${PORT}/properties`);
    console.log(`   🏡 Property Detail:        http://localhost:${PORT}/property/1`);
    console.log(`   ℹ️  About:                 http://localhost:${PORT}/about`);
    console.log(`   🛠️  Services:              http://localhost:${PORT}/services`);
    console.log(`   📞 Contact:               http://localhost:${PORT}/contact`);
    console.log(`   👤 Profile:               http://localhost:${PORT}/profile`);
    console.log(`   🔑 Change Password:       http://localhost:${PORT}/change-password`);
    console.log(`   💬 Chat:                  http://localhost:${PORT}/chat`);
    console.log('');
    console.log('🔐 Authentication:');
    console.log(`   🔑 Login:                 http://localhost:${PORT}/login`);
    console.log(`   📝 Register:              http://localhost:${PORT}/register`);
    console.log(`   🚪 Logout:                http://localhost:${PORT}/logout`);
    console.log('');
    console.log('🎯 MVC Architecture:');
    console.log('   📁 Controllers: Handle business logic');
    console.log('   📁 Services: Handle data processing');
    console.log('   📁 Routes: Handle URL routing');
    console.log('   📁 Models: Handle data models');
    console.log('   📁 Config: Handle configurations');
    console.log('');
    console.log('🚀 Ready to serve your secure real estate website!');
});
