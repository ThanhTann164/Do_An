// Post Navigation Handler
// Handles Post button clicks based on user role

window.handlePostClick = function(event) {
    event.preventDefault();
    
    // Check user role and redirect accordingly
    fetch('/api/user', { credentials: 'include' })
        .then(response => {
            if (response.status === 401) {
                // Not logged in, redirect to login
                window.location.href = '/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            const user = data.data || data.user || {};
            console.log('🔍 [post-nav] User role:', user.role);
            
            if (user.role === 'Seller' || user.role === 'Buyer') {
                // Seller & Buyer: đi tới danh sách bài đăng
                window.location.href = '/posts';
            } else {
                // Admin or other roles: Go to home
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('❌ [post-nav] Error checking user role:', error);
            // On error, redirect to login
            window.location.href = '/login';
        });
};
