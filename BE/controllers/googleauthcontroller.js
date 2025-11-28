const googleAuthService = require('../Services/googleAuthService');
const { JWT_SECRET } = require('../Config/jwt.config');

exports.getGoogleConfig = (req, res) => {
    console.log('🔍 Debug Google Client ID:', process.env.GOOGLE_CLIENT_ID);
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'your_google_client_id_here' || !clientId.includes('apps.googleusercontent.com')) {
        return res.json({
            success: false,
            error: 'Google OAuth chưa được cấu hình',
            message: 'Chạy lệnh: node setup-google-oauth.js',
            instructions: 'Hoặc cấu hình thủ công trong file config.env'
        });
    }
    
    res.json({
        success: true,
        clientId: clientId
    });
};

exports.googleLogin = async (req, res) => {
    console.log('🔍 Debug - Google login request body:', Object.keys(req.body));
    
    const { credential } = req.body;
    
    console.log('🔍 Debug - Credential received:', credential ? 'Yes' : 'No');
    console.log('🔍 Debug - Credential type:', typeof credential);
    
    if (!credential) {
        return res.status(400).json({
            success: false,
            message: 'Google credential is required'
        });
    }

    try {
        const result = await googleAuthService.authenticateWithGoogle(credential);
        const jwt = require('jsonwebtoken');
        const dbUser = result.user;
        
        console.log('🔍 [Google Auth] dbUser object:', {
            UserID: dbUser.UserID,
            FullName: dbUser.FullName,
            Email: dbUser.Email,
            Role: dbUser.Role,
            PhoneNumber: dbUser.PhoneNumber,
            Status: dbUser.Status
        });
        
        const tokenPayload = {
            userId: dbUser.UserID || dbUser.user_id,
            email: dbUser.Email || dbUser.email,
            role: dbUser.Role || 'Buyer',
            username: dbUser.username || dbUser.Email || dbUser.email,
            display_name: dbUser.display_name || dbUser.FullName || dbUser.username || '',
            phone: dbUser.phone || dbUser.PhoneNumber || ''
        };
        
        console.log('🔍 [Google Auth] Token payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ [Google Auth] Google user logged in:', result.user.Email);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        // Return JSON for React app with token
        const responseUser = {
            userId: dbUser.UserID || dbUser.user_id,
            id: dbUser.UserID || dbUser.user_id,
            email: dbUser.Email || dbUser.email,
            role: dbUser.Role || 'Buyer',
            username: dbUser.username || dbUser.Email || dbUser.email,
            display_name: dbUser.FullName || dbUser.display_name || dbUser.username || '',
            fullName: dbUser.FullName || dbUser.display_name || dbUser.username || '',
            phone: dbUser.PhoneNumber || dbUser.phone || ''
        };
        
        console.log('🔍 [Google Auth] Response user:', responseUser);
        
        return res.json({
            success: true,
            message: 'Đăng nhập Google thành công',
            token: token,
            user: responseUser
        });
    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
