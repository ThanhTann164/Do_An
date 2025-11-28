// Google OAuth Integration for Node.js Project
class GoogleAuth {
    constructor() {
        this.clientId = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Fetch Google Client ID from backend
            const response = await fetch('/api/google-config');
            const data = await response.json();
            
            if (data.success && data.clientId) {
                this.clientId = data.clientId;
                await this.loadGoogleScript();
                this.initializeGoogleSignIn();
            } else {
                console.error('Google OAuth chưa được cấu hình');
                this.showConfigurationMessage(data.error, data.message, data.instructions);
            }
        } catch (error) {
            console.error('Error initializing Google Auth:', error);
        }
    }

    async loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (document.getElementById('google-signin-script')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-signin-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('✅ Google Sign-In script loaded');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Google Sign-In script');
                reject(new Error('Failed to load Google Sign-In script'));
            };
            
            document.head.appendChild(script);
        });
    }

    initializeGoogleSignIn() {
        if (!window.google || !this.clientId) {
            console.error('Google Sign-In not available or Client ID missing');
            return;
        }

        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        this.isInitialized = true;
        console.log('✅ Google Sign-In initialized with Client ID:', this.clientId);
        
        // Render sign-in button if container exists
        this.renderSignInButton();
    }

    renderSignInButton() {
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer && this.isInitialized) {
            window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                logo_alignment: 'left',
                width: 250
            });
            console.log('✅ Google Sign-In button rendered');
        }
    }

    async handleCredentialResponse(response) {
        try {
            console.log('🔐 Google credential received');
            console.log('🔍 Debug - Response object:', response);
            console.log('🔍 Debug - Credential type:', typeof response.credential);
            console.log('🔍 Debug - Credential length:', response.credential ? response.credential.length : 'null');
            console.log('🔍 Debug - Credential preview:', response.credential ? response.credential.substring(0, 50) + '...' : 'null');
            
            // Show loading state
            this.showMessage('Đang đăng nhập với Google...', 'info');
            
            // Send credential to backend
            const loginResponse = await fetch('/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            });

            console.log('🔍 Debug - Response status:', loginResponse.status);
            console.log('🔍 Debug - Response headers:', [...loginResponse.headers.entries()]);
            
            // Nếu server đã redirect, điều hướng theo
            if (loginResponse.redirected) {
                window.location.href = loginResponse.url || '/';
                return;
            }

            const contentType = loginResponse.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const result = await loginResponse.json();
                console.log('🔍 Debug - Backend JSON response:', result);
                if (result.success) {
                    this.showMessage(result.message || 'Đăng nhập thành công', 'success');
                    setTimeout(() => { window.location.href = '/'; }, 500);
                } else {
                    this.showMessage(result.message || 'Đăng nhập Google thất bại', 'error');
                    console.error('❌ Google login failed:', result.message);
                }
            } else {
                // Không phải JSON (có thể là HTML do redirect). Điều hướng về home.
                const _ = await loginResponse.text();
                window.location.href = '/';
            }
        } catch (error) {
            console.error('❌ Error during Google login:', error);
            this.showMessage('Lỗi kết nối. Vui lòng thử lại.', 'error');
        }
    }

    showConfigurationMessage(error = 'Google OAuth chưa được cấu hình', message = 'Chạy lệnh: node setup-google-oauth.js', instructions = 'Hoặc cấu hình thủ công trong file config.env') {
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
            buttonContainer.innerHTML = `
                <div style="
                    border: 2px dashed #ffc107;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    background: #fff9e6;
                    color: #856404;
                    font-size: 14px;
                    margin: 15px 0;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ffc107;"></i>
                    <div><strong>${error}</strong></div>
                    <div style="margin-top: 8px; font-size: 12px;">
                        ${message}<br>
                        ${instructions}
                    </div>
                </div>
            `;
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.google-auth-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `google-auth-message alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            font-weight: 500;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Method to programmatically trigger Google Sign-In
    signIn() {
        if (this.isInitialized && window.google) {
            window.google.accounts.id.prompt();
        } else {
            console.error('Google Sign-In not initialized');
            this.showMessage('Google Sign-In chưa sẵn sàng. Vui lòng thử lại.', 'error');
        }
    }
}

// Initialize Google Auth when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.googleAuth = new GoogleAuth();
    
    // Add CSS for better styling
    const style = document.createElement('style');
    style.textContent = `
        .google-signin-container {
            margin: 20px 0;
            text-align: center;
        }
        
        .google-signin-divider {
            display: flex;
            align-items: center;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
        }
        
        .google-signin-divider::before,
        .google-signin-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #ddd;
        }
        
        .google-signin-divider span {
            padding: 0 15px;
            background: white;
        }
        
        #google-signin-button {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px auto;
        }
        
        .alert {
            border: 1px solid transparent;
            border-radius: 0.375rem;
        }
        
        .alert-success {
            background-color: #d1e7dd;
            border-color: #badbcc;
            color: #0f5132;
        }
        
        .alert-danger {
            background-color: #f8d7da;
            border-color: #f5c2c7;
            color: #842029;
        }
        
        .alert-info {
            background-color: #d1ecf1;
            border-color: #b8daff;
            color: #055160;
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleAuth;
}
