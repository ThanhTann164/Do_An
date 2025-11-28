(async function initUserToolbar() {
    const toolbarEl = document.getElementById('user-toolbar');
    if (toolbarEl) {
        try { toolbarEl.remove(); } catch (_) { toolbarEl.style.display = 'none'; toolbarEl.innerHTML = ''; }
    }

    // Đảm bảo các mục menu nằm cùng một hàng trên desktop
    function ensureInlineNav() {
        if (document.getElementById('inline-nav-style')) return;
        const style = document.createElement('style');
        style.id = 'inline-nav-style';
        style.textContent = `
          /* ép các item menu nằm cùng hàng và căn phải */
          .site-nav .site-menu { display: flex !important; align-items: center; gap: 14px; flex-wrap: nowrap; }
          .site-nav .site-menu li { display: inline-flex; align-items: center; }
          .site-nav .site-navigation { width: 100%; }
          .site-nav .logo { margin-right: auto !important; }
        `;
        document.head.appendChild(style);
    }
    ensureInlineNav();

    function renderGuest(root) {
        const wantsBanner = root && root.dataset && root.dataset.mode === 'banner';
        if (wantsBanner) {
            root.innerHTML = `
              <div style="background:#0d6efd;color:white;padding:10px 0;">
                <div class="container d-flex justify-content-end gap-2">
                  <a href="/login" class="btn btn-sm btn-light">Đăng nhập</a>
                  <a href="/register" class="btn btn-sm btn-outline-light">Đăng ký</a>
                </div>
              </div>
            `;
        } else if (root) {
            root.innerHTML = '';
        }

		// Cập nhật navbar hiện có (nếu tồn tại)
		// Cập nhật đồng thời cho cả desktop và menu clone trên mobile
		const authMenus = document.querySelectorAll('#auth-menu');
		authMenus.forEach((el) => {
			el.style.display = 'list-item';
			el.innerHTML = '<a href="/login">Login</a>';
		});
		const deviceMenus = document.querySelectorAll('#device-menu');
		deviceMenus.forEach((el) => {
			el.style.display = 'none';
		});
	}

    function renderUser(root, user) {
        const wantsBanner = root && root.dataset && root.dataset.mode === 'banner';
        if (wantsBanner) {
            root.innerHTML = `
              <div style="background: linear-gradient(135deg, #2eca6a 0%, #1e88e5 100%); color: white; padding: 10px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div class="container">
                  <div class="d-flex flex-wrap align-items-center justify-content-between">
                    <div class="fw-semibold"><i class="fas fa-user-circle me-2"></i>${user.email} (${user.role})</div>
                    <div class="d-flex gap-2">
                      ${user.role === 'Admin' ? '<a href="/admin" class="btn btn-sm btn-light">Admin</a>' : ''}
                      ${user.role === 'Seller' ? '<a href="/devices" class="btn btn-sm btn-light">Thiết bị</a>' : ''}
                      <a href="/profile" class="btn btn-sm btn-light">Tài khoản</a>
                      <a href="/change-password" class="btn btn-sm btn-outline-light">Đổi mật khẩu</a>
                      <a href="/logout" class="btn btn-sm btn-danger">Đăng xuất</a>
                    </div>
                  </div>
                </div>
              </div>
            `;
        } else if (root) {
            root.innerHTML = '';
        }

		// Cập nhật navbar hiện có (nếu tồn tại)
		const displayName = user.display_name || user.username || user.email;
		const authMenus = document.querySelectorAll('#auth-menu');
		authMenus.forEach((el) => {
			el.style.display = 'list-item';
			el.classList.add('has-children');
			el.innerHTML = `
			  <a href="/profile">Hi, ${displayName}</a>
			  <ul class="dropdown">
			    <li><a href="/profile">Trang cá nhân</a></li>
			    <li><a href="/change-password">Đổi mật khẩu</a></li>
			    <li><a href="/logout">Logout</a></li>
			  </ul>
			`;
		});
        const deviceMenus = document.querySelectorAll('#device-menu');
        deviceMenus.forEach((el) => {
            // Hiển thị mục Device cho tất cả người dùng đã đăng nhập (Buyer, Seller, Admin)
            el.style.display = 'list-item';
        });
        ensureInlineNav();
	}

	try {
		// Kiểm tra token từ localStorage trước
		const token = localStorage.getItem('token');
		const headers = { 'Content-Type': 'application/json' };
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		
		const res = await fetch('/api/user', { 
			credentials: 'include',
			headers: headers
		});
		
		if (res.status === 401) {
			// Xóa token không hợp lệ
			if (token) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
			
			// Không redirect về login nếu đang ở trang login hoặc register
			if (location.pathname === '/login' || location.pathname === '/register') {
				renderGuest(toolbarEl);
				return;
			}
			
			// Ở trang cần bảo vệ thì đưa về login, còn lại hiển thị guest
			const protectedPaths = ['/profile', '/devices'];
			if (protectedPaths.includes(location.pathname) || location.pathname.startsWith('/device/')) {
				location.replace('/login');
				return;
			}
			renderGuest(toolbarEl);
			return;
		}
		if (!res.ok) {
			renderGuest(toolbarEl);
			return;
		}
		const body = await res.json();
		const user = body.data || body.user || {};
		renderUser(toolbarEl, user);
	} catch (e) {
		console.error('user-toolbar error', e);
		renderGuest(toolbarEl);
	}
})();

// User Toolbar Component
// Sử dụng để hiển thị thanh toolbar cho user đã đăng nhập

// Load User Toolbar
function loadUserToolbar(user) {
    const toolbar = document.getElementById('user-toolbar');
    if (!toolbar) return;
    
    toolbar.innerHTML = `
        <div style="background: linear-gradient(135deg, #2eca6a 0%, #1e88e5 100%); color: white; padding: 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: relative; z-index: 9999;">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center;">
                            <i class="fas fa-user-circle" style="font-size: 24px; margin-right: 10px;"></i>
                            <span style="font-weight: 600; font-size: 16px;">
                                Xin chào, ${user.display_name || user.username}
                            </span>
                        </div>
                        <span style="font-size: 14px; opacity: 0.8; display: flex; align-items: center;">
                            <i class="fas fa-envelope" style="margin-right: 5px;"></i>
                            ${user.email}
                        </span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <a href="/profile" 
                           style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 500; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; white-space: nowrap;" 
                           onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-1px)'" 
                           onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                            <i class="fas fa-user" style="margin-right: 5px;"></i>Trang cá nhân
                        </a>
                        <a href="/logout" onclick="confirmLogout(event)" 
                           style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 500; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; white-space: nowrap;"
                           onmouseover="this.style.background='rgba(255,107,107,0.3)'; this.style.transform='translateY(-1px)'" 
                           onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                            <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i>Đăng xuất
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm cập nhật Device menu dựa trên role
function updateDeviceMenu(user) {
    const deviceMenu = document.getElementById('device-menu');
    if (deviceMenu) {
        // Tạm thời hiển thị cho tất cả user để test
        deviceMenu.style.display = 'list-item';
        deviceMenu.style.visibility = 'visible';
        console.log('✅ Device menu shown for all users (testing)');
        
        // Logic ban đầu (comment lại để test)
        // if (user.role === 'Seller') {
        //     deviceMenu.style.display = 'list-item';
        //     console.log('✅ Device menu shown for Seller');
        // } else {
        //     deviceMenu.style.display = 'none';
        //     console.log('✅ Device menu hidden for non-Seller');
        // }
    }
}

// Auto load toolbar cho user đã đăng nhập
function autoLoadUserToolbar() {
    fetch('/api/user', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            console.log('🔍 [user-toolbar] User data:', data);
            if (data.success && data.user) {
                loadUserToolbar(data.user);
                updateDeviceMenu(data.user);
                
                // Debug: Force show device menu if user is Seller
                if (data.user.role === 'Seller') {
                    const deviceMenu = document.getElementById('device-menu');
                    console.log('🔍 [user-toolbar] Device menu element:', deviceMenu);
                    if (deviceMenu) {
                        deviceMenu.style.display = 'list-item';
                        deviceMenu.style.visibility = 'visible';
                        console.log('✅ [user-toolbar] Force showing device menu for Seller');
                    }
                }
                
                // Thay thế menu login thành user dropdown
                console.log('🔄 Replacing login menu with user dropdown for:', data.user.username);
                const authMenu = document.getElementById('auth-menu');
                if (authMenu) {
                    authMenu.innerHTML = `
                        <div class="user-dropdown" style="position: relative; display: inline-block;">
                            <a href="#" class="user-toggle" onclick="toggleUserMenu(event)" 
                               style="color: #2eca6a; font-weight: 600; text-decoration: none; padding: 5px 10px; border-radius: 5px; transition: all 0.3s; display: flex; align-items: center;">
                                <i class="fas fa-user-circle" style="margin-right: 8px; font-size: 18px;"></i>
                                ${data.user.display_name || data.user.username} <i class="fas fa-chevron-down" style="margin-left: 5px; font-size: 12px;"></i>
                            </a>
                            <div class="user-menu" id="user-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 0; min-width: 220px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1000; margin-top: 8px;">
                                <div style="padding: 15px; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                                    <div style="font-weight: 600; color: #333; margin-bottom: 5px; display: flex; align-items: center;">
                                        <i class="fas fa-user" style="margin-right: 8px; color: #2eca6a;"></i>
                                        ${data.user.display_name || data.user.username}
                                    </div>
                                    <div style="font-size: 13px; color: #666; margin-bottom: 3px; display: flex; align-items: center;">
                                        <i class="fas fa-envelope" style="margin-right: 8px; color: #17a2b8; width: 14px;"></i>
                                        ${data.user.email}
                                    </div>
                                    <div style="font-size: 13px; color: #666; display: flex; align-items: center;">
                                        <i class="fas fa-phone" style="margin-right: 8px; color: #28a745; width: 14px;"></i>
                                        ${data.user.phone || 'Chưa cập nhật'}
                                    </div>
                                </div>
                                <div style="padding: 8px;">
                                    <a href="/profile" style="color: #495057; text-decoration: none; display: flex; align-items: center; padding: 8px 12px; border-radius: 5px; font-weight: 500; transition: background 0.3s; margin-bottom: 5px;" 
                                       onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='transparent'">
                                        <i class="fas fa-user" style="margin-right: 10px; color: #2eca6a; width: 16px;"></i>
                                        Trang cá nhân
                                    </a>
                                    <a href="/logout" onclick="confirmLogout(event)" style="color: #dc3545; text-decoration: none; display: flex; align-items: center; padding: 8px 12px; border-radius: 5px; font-weight: 500; transition: background 0.3s;" 
                                       onmouseover="this.style.background='#f8d7da'" onmouseout="this.style.background='transparent'">
                                        <i class="fas fa-sign-out-alt" style="margin-right: 10px; color: #dc3545; width: 16px;"></i>
                                        Đăng xuất
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.log('Auth check failed:', error);
        });
}

// Hàm toggle user dropdown menu trong navigation
window.toggleUserMenu = function(event) {
    event.preventDefault();
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) {
        if (menu.style.display === 'none' || menu.style.display === '') {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    }
};

// Hàm xác nhận đăng xuất
window.confirmLogout = function(event) {
    event.preventDefault();
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
        window.location.href = '/logout';
    }
};

// Auto load khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Chỉ auto load nếu không phải trang login/register
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
        autoLoadUserToolbar();
    }
    
    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', function(event) {
        const userDropdown = document.querySelector('.user-dropdown');
        const menu = document.getElementById('user-dropdown-menu');
        
        if (userDropdown && menu && !userDropdown.contains(event.target)) {
            menu.style.display = 'none';
        }
    });
});
