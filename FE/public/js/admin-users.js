// Admin Users Management JavaScript

let currentPage = 1;
let totalPages = 1;
let usersData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadUserInfo();
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('admin-name').textContent = data.user.full_name || 'Admin';
            document.getElementById('current-user').textContent = data.user.full_name || 'Admin';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load users list
async function loadUsers(page = 1, search = '', roleFilter = '', statusFilter = '') {
    try {
        // Handle special filters
        let actualStatusFilter = statusFilter;
        let actualRoleFilter = roleFilter;
        let excludeBuyers = false;
        
        if (statusFilter === 'buyer-active') {
            // "Chưa mua" = Buyer + Active
            actualStatusFilter = 'Active';
            if (!roleFilter || roleFilter === '') {
                actualRoleFilter = 'Buyer';
            }
        } else if (statusFilter === 'Active') {
            // "Active" should exclude Buyers (they show as "Chưa mua")
            actualStatusFilter = 'Active';
            excludeBuyers = true;
        }
        
        console.log('🔍 Filter debug:', {
            original: { roleFilter, statusFilter },
            actual: { actualRoleFilter, actualStatusFilter }
        });
        
        const queryParams = new URLSearchParams({
            page: page,
            limit: 20,
            search: search,
            role: actualRoleFilter,
            status: actualStatusFilter,
            excludeBuyers: excludeBuyers
        });

        const response = await fetch(`/api/admin/users?${queryParams}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('🔍 API Request URL:', `/api/admin/users?${queryParams}`);
        console.log('🔍 API Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response data:', data);
            console.log('📊 Users found:', data.data?.length || 0);
            usersData = data.data || [];
            displayUsers(usersData);
            updatePagination(data.pagination || {});
            document.getElementById('total-users-count').textContent = data.total || 0;
        } else {
            const errorData = await response.json();
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.message || 'Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        displayUsers([]);
        showAlert('Lỗi khi tải danh sách users', 'danger');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Không có users nào
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.UserID}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">
                        <i class="fas fa-user-circle fa-2x text-muted"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${user.FullName || 'N/A'}</div>
                        <small class="text-muted">ID: ${user.UserID}</small>
                    </div>
                </div>
            </td>
            <td>${user.Email}</td>
            <td>${user.PhoneNumber || 'N/A'}</td>
            <td>
                <span class="badge bg-${getRoleBadgeColor(user.Role)}">
                    ${user.Role}
                </span>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(user.Status, user.Role)}">
                    ${getStatusText(user.Status, user.Role)}
                </span>
            </td>
            <td>${formatDateTime(user.CreatedAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewUser(${user.UserID})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editUser(${user.UserID})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.Role === 'Buyer' ? `
                        <button class="btn-action btn-approve" onclick="showApproveSellerModal(${user.UserID})" title="Duyệt thành Seller" style="background-color: #28a745; color: white;">
                            <i class="fas fa-user-check"></i>
                        </button>
                    ` : ''}
                    ${user.Role !== 'Admin' ? `
                        <button class="btn-action btn-delete" onclick="deleteUser(${user.UserID})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Get role badge color
function getRoleBadgeColor(role) {
    switch (role) {
        case 'Admin': return 'danger';
        case 'Seller': return 'warning';
        case 'Buyer': return 'info';
        default: return 'secondary';
    }
}

// Get status class
function getStatusClass(status, role) {
    // Special handling for Buyer role
    if (role === 'Buyer' && status === 'Active') {
        return 'pending'; // Use pending style for "Chưa mua"
    }
    
    switch (status.toLowerCase()) {
        case 'active': return 'active';
        case 'inactive': return 'inactive';
        case 'suspended': return 'inactive';
        default: return 'pending';
    }
}

// Get status text
function getStatusText(status, role) {
    // Special handling for Buyer role
    if (role === 'Buyer' && status === 'Active') {
        return 'Chưa mua';
    }
    
    // For other roles, return original status
    return status;
}

// Format date time
function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

// Handle status filter change
function handleStatusFilterChange() {
    const statusFilter = document.getElementById('filter-status').value;
    const roleFilter = document.getElementById('filter-role');
    
    // If "Chưa mua" is selected, suggest setting role to Buyer
    if (statusFilter === 'buyer-active') {
        if (!roleFilter.value || roleFilter.value === '') {
            roleFilter.value = 'Buyer';
        }
    }
    
    // Auto search when filter changes
    searchUsers();
}

// Search users
function searchUsers() {
    const search = document.getElementById('search-users').value;
    const roleFilter = document.getElementById('filter-role').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    currentPage = 1;
    loadUsers(currentPage, search, roleFilter, statusFilter);
}

// Refresh users list
function refreshUsers() {
    document.getElementById('search-users').value = '';
    document.getElementById('filter-role').value = '';
    document.getElementById('filter-status').value = '';
    currentPage = 1;
    loadUsers();
}

// Update pagination
function updatePagination(pagination) {
    currentPage = pagination.currentPage || 1;
    totalPages = pagination.totalPages || 1;
    
    const paginationEl = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Trước</a>
        </li>
    `;
    
    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Sau</a>
        </li>
    `;
    
    paginationEl.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    const search = document.getElementById('search-users').value;
    const roleFilter = document.getElementById('filter-role').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    loadUsers(page, search, roleFilter, statusFilter);
}


// View user details
function viewUser(userId) {
    const user = usersData.find(u => u.UserID === userId);
    if (!user) return;
    
    // Create a simple modal to show user details
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal fade';
    detailsModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Chi tiết User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <tr><td><strong>ID:</strong></td><td>${user.UserID}</td></tr>
                        <tr><td><strong>Họ tên:</strong></td><td>${user.FullName || 'N/A'}</td></tr>
                        <tr><td><strong>Email:</strong></td><td>${user.Email}</td></tr>
                        <tr><td><strong>Số điện thoại:</strong></td><td>${user.PhoneNumber || 'N/A'}</td></tr>
                        <tr><td><strong>Role:</strong></td><td><span class="badge bg-${getRoleBadgeColor(user.Role)}">${user.Role}</span></td></tr>
                        <tr><td><strong>Trạng thái:</strong></td><td><span class="status-badge ${getStatusClass(user.Status, user.Role)}">${getStatusText(user.Status, user.Role)}</span></td></tr>
                        <tr><td><strong>Ngày tạo:</strong></td><td>${formatDateTime(user.CreatedAt)}</td></tr>
                        <tr><td><strong>Cập nhật cuối:</strong></td><td>${formatDateTime(user.UpdatedAt)}</td></tr>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailsModal);
    const modal = new bootstrap.Modal(detailsModal);
    modal.show();
    
    // Remove modal after hiding
    detailsModal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(detailsModal);
    });
}

// Edit user
function editUser(userId) {
    const user = usersData.find(u => u.UserID === userId);
    if (!user) return;
    
    // Fill edit form
    document.getElementById('editUserId').value = user.UserID;
    document.getElementById('editFullName').value = user.FullName || '';
    document.getElementById('editEmail').value = user.Email;
    document.getElementById('editPhoneNumber').value = user.PhoneNumber || '';
    document.getElementById('editRole').value = user.Role;
    document.getElementById('editStatus').value = user.Status;
    
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

// Update user
async function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const formData = {
        fullName: document.getElementById('editFullName').value,
        email: document.getElementById('editEmail').value,
        phoneNumber: document.getElementById('editPhoneNumber').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value
    };
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            showAlert('Cập nhật user thành công', 'success');
            loadUsers(currentPage);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Lỗi khi cập nhật user', 'danger');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('Lỗi khi cập nhật user', 'danger');
    }
}

// Delete user
async function deleteUser(userId) {
    const user = usersData.find(u => u.UserID === userId);
    if (!user) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa user "${user.FullName || user.Email}"?\nHành động này không thể hoàn tác.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showAlert('Xóa user thành công', 'success');
            loadUsers(currentPage);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Lỗi khi xóa user', 'danger');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Lỗi khi xóa user', 'danger');
    }
}

// Show approve seller modal
function showApproveSellerModal(userId) {
    const user = usersData.find(u => u.UserID === userId);
    if (!user) return;
    
    // Create modal dynamically
    const modalHtml = `
        <div class="modal fade" id="approveSellerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-check text-success me-2"></i>
                            Duyệt User trở thành Seller
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Bạn đang duyệt user <strong>${user.FullName}</strong> (${user.Email}) từ trạng thái <strong>${getStatusText(user.Status, user.Role)}</strong> trở thành <strong>Seller</strong>.
                        </div>
                        
                        <div class="mb-3">
                            <label for="approveReason" class="form-label">Lý do duyệt (tùy chọn)</label>
                            <textarea 
                                class="form-control" 
                                id="approveReason" 
                                rows="3" 
                                placeholder="Nhập lý do duyệt user này thành seller..."
                            ></textarea>
                        </div>
                        
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Lưu ý:</strong> Sau khi duyệt, user này sẽ có quyền đăng bán sản phẩm trên hệ thống.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>Hủy
                        </button>
                        <button type="button" class="btn btn-success" onclick="approveSeller(${userId})">
                            <i class="fas fa-check me-1"></i>Duyệt thành Seller
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('approveSellerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('approveSellerModal'));
    modal.show();
    
    // Remove modal after hiding
    document.getElementById('approveSellerModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Approve user as seller
async function approveSeller(userId) {
    const reason = document.getElementById('approveReason').value.trim();
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/approve-seller`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('approveSellerModal'));
            modal.hide();
            
            // Show success message
            showAlert(result.message, 'success');
            
            // Reload users list
            loadUsers(currentPage);
            
            console.log('✅ Seller approval successful:', result.data);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Lỗi khi duyệt user thành Seller', 'danger');
        }
    } catch (error) {
        console.error('Error approving seller:', error);
        showAlert('Lỗi khi duyệt user thành Seller', 'danger');
    }
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
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

// Handle Enter key in search input
document.getElementById('search-users').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUsers();
    }
});
