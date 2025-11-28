const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleauthcontroller');


// Google OAuth configuration endpoint
router.get('/config', googleAuthController.getGoogleConfig);

// Backward compatibility for FE cũ
router.get('/api/google-config', googleAuthController.getGoogleConfig);

// Google OAuth login (mounted at /api/google)
router.post('/callback', googleAuthController.googleLogin);

// Backward compatibility for old FE (route will be /auth/google when mounted at root)
router.post('/auth/google', googleAuthController.googleLogin);

module.exports = router;
