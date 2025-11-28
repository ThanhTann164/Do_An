// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    initializeCharts();
    
    // Load recent activities
    loadRecentActivities();
    
    // Set up auto-refresh
    setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
});

// Load dashboard statistics
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboardCards(data.data);
            updateUserInfo(data.user);
        } else {
            console.error('Failed to load dashboard data');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update dashboard cards with data
function updateDashboardCards(data) {
    document.getElementById('total-users').textContent = formatNumber(data.totalUsers || 0);
    document.getElementById('total-products').textContent = formatNumber(data.totalProducts || 0);
    document.getElementById('total-orders').textContent = formatNumber(data.totalOrders || 0);
    document.getElementById('total-revenue').textContent = formatCurrency(data.revenue || 0);
}

// Update user information
function updateUserInfo(user) {
    document.getElementById('admin-name').textContent = user.full_name || 'Admin';
    document.getElementById('current-user').textContent = user.full_name || 'Admin';
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format currency (VND)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Initialize charts
function initializeCharts() {
    // Transaction Chart
    const transactionCtx = document.getElementById('transactionChart').getContext('2d');
    new Chart(transactionCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Giao dịch',
                data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });

    // User Role Chart
    const userRoleCtx = document.getElementById('userRoleChart').getContext('2d');
    new Chart(userRoleCtx, {
        type: 'doughnut',
        data: {
            labels: ['Buyers', 'Sellers', 'Admins'],
            datasets: [{
                data: [65, 30, 5],
                backgroundColor: [
                    '#4facfe',
                    '#f093fb',
                    '#667eea'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Load recent activities
async function loadRecentActivities() {
    try {
        const response = await fetch('/api/admin/recent-activities', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecentActivities(data.activities || []);
        } else {
            displayRecentActivities([]);
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
        displayRecentActivities([]);
    }
}

// Display recent activities
function displayRecentActivities(activities) {
    const tbody = document.getElementById('recent-activities');
    
    if (activities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Không có hoạt động gần đây
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${formatDateTime(activity.timestamp)}</td>
            <td>${activity.user_name || 'Unknown'}</td>
            <td>${activity.action}</td>
            <td>
                <span class="status-badge ${getStatusClass(activity.status)}">
                    ${activity.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Format date time
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
}

// Get status class for badge
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'success':
        case 'completed':
        case 'active':
            return 'active';
        case 'failed':
        case 'error':
        case 'inactive':
            return 'inactive';
        case 'pending':
        case 'processing':
            return 'pending';
        default:
            return 'pending';
    }
}

// Update system uptime
function updateSystemUptime() {
    const startTime = new Date('2024-01-01'); // Replace with actual system start time
    const now = new Date();
    const uptime = now - startTime;
    
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('system-uptime').textContent = `${days}d ${hours}h ${minutes}m`;
}

// Update last backup time
function updateLastBackup() {
    // This should be replaced with actual backup time from API
    const lastBackup = new Date();
    lastBackup.setHours(lastBackup.getHours() - 2); // 2 hours ago
    document.getElementById('last-backup').textContent = formatDateTime(lastBackup);
}

// Initialize system info
updateSystemUptime();
updateLastBackup();

// Update system info every minute
setInterval(() => {
    updateSystemUptime();
}, 60000);

// Handle navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Remove active class from all items
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        this.classList.add('active');
    });
});

// Mobile sidebar toggle (for responsive design)
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');
}

// Add mobile menu button if needed
if (window.innerWidth <= 768) {
    const header = document.querySelector('.admin-header');
    const menuButton = document.createElement('button');
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.className = 'btn btn-outline-secondary me-3';
    menuButton.onclick = toggleSidebar;
    header.insertBefore(menuButton, header.firstChild);
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.querySelector('.admin-sidebar').classList.remove('active');
    }
});

// Error handling for API calls
function handleApiError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Lỗi:</strong> Không thể tải ${context}. Vui lòng thử lại sau.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const content = document.querySelector('.admin-content');
    content.insertBefore(alertDiv, content.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Logout confirmation
document.querySelector('.logout-btn').addEventListener('click', function(e) {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        e.preventDefault();
    }
});
