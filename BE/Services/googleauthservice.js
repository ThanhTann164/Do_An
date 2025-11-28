const userRepository = require('../repositories/user.repository');

exports.authenticateWithGoogle = async (credential) => {
    try {
        console.log('🔍 Debug - Received credential type:', typeof credential);
        console.log('🔍 Debug - Credential length:', credential ? credential.length : 'null');
        
        // Validate credential format
        if (!credential || typeof credential !== 'string') {
            throw new Error('Credential must be a valid string');
        }
        
        // Check JWT format (should have 3 parts separated by dots)
        const parts = credential.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format - must have 3 parts');
        }
        
        // Decode JWT token (in production, verify with Google)
        let payload;
        try {
            const decodedString = Buffer.from(parts[1], 'base64').toString();
            console.log('🔍 Debug - Decoded string:', decodedString.substring(0, 100) + '...');
            payload = JSON.parse(decodedString);
        } catch (parseError) {
            console.error('❌ JWT decode error:', parseError);
            throw new Error('Failed to decode JWT token');
        }
        
        console.log('🔍 Debug - Payload keys:', Object.keys(payload));
        
        const { email, name, picture, sub: googleId } = payload;
        
        console.log('🔍 Debug - Extracted data:', { email, name, googleId: googleId ? 'present' : 'missing' });
        
        if (!email || !name) {
            throw new Error(`Missing required fields - email: ${!!email}, name: ${!!name}`);
        }

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        
        if (existingUser) {
            // User exists - update full name if different
            if (!existingUser.FullName || existingUser.FullName !== name) {
                await userRepository.updateFullName(existingUser.UserID, name);
                existingUser.FullName = name;
            }
            
            // Convert to plain object to ensure all properties are accessible
            const userPlain = existingUser.toJSON ? existingUser.toJSON() : existingUser;
            console.log('🔍 Debug - Existing user plain:', {
                UserID: userPlain.UserID,
                FullName: userPlain.FullName,
                Email: userPlain.Email,
                Role: userPlain.Role
            });
            
            return {
                user: userPlain,
                message: 'Đăng nhập Google thành công!'
            };
        } else {
            // Create new user from Google
            const bcrypt = require('bcrypt');
            const randomPassword = Math.random().toString(36).slice(-8) + 'A1'; // Generate random password
            const hashedPassword = await bcrypt.hash(randomPassword, 12); // Hash the password
            const uniquePhone = `G${Date.now().toString().slice(-8)}`; // Tạo số điện thoại ngắn hơn (8-9 ký tự)
            
            console.log('🔍 Debug - Creating new user with data:', {
                fullName: name,
                email,
                phone: uniquePhone,
                password: randomPassword,
                role: 'Buyer',
                status: 'Active'
            });
            
            const newUserId = await userRepository.createGoogleUser({
                FullName: name,
                Email: email,
                PhoneNumber: uniquePhone,
                PasswordHash: hashedPassword,
                Role: 'Buyer',
                Status: 'Active'
            });

            const newUser = {
                UserID: newUserId,
                FullName: name,
                Email: email,
                PhoneNumber: uniquePhone,
                Role: 'Buyer',
                Status: 'Active'
            };
            
            console.log('🔍 Debug - New user created:', {
                UserID: newUser.UserID,
                FullName: newUser.FullName,
                Email: newUser.Email,
                Role: newUser.Role
            });
            
            return {
                user: newUser,
                message: 'Tạo tài khoản và đăng nhập Google thành công!'
            };
        }
    } catch (decodeError) {
        console.error('❌ Google Auth Service Error:', decodeError.message);
        console.error('❌ Full error:', decodeError);
        throw new Error(`Google authentication failed: ${decodeError.message}`);
    }
};
