-- ============================================
-- KIỂM TRA DỮ LIỆU PACKAGES VÀ USER PACKAGES
-- ============================================

-- 1. Xem tất cả các packages có trong hệ thống
SELECT 
    id,
    name,
    display_name,
    description,
    price,
    daily_post,
    daily_boost,
    created_at,
    updated_at
FROM packages
ORDER BY id;

-- 2. Xem chi tiết từng package
SELECT 
    p.id,
    p.name AS package_name,
    p.display_name,
    p.price,
    p.daily_post AS max_posts_per_day,
    p.daily_boost AS boost_per_day,
    p.description
FROM packages p
ORDER BY 
    CASE p.name
        WHEN 'FREE' THEN 1
        WHEN 'PRO' THEN 2
        WHEN 'PREMIUM' THEN 3
        ELSE 4
    END;

-- 3. Xem user packages - Gói mà users đang sử dụng
SELECT 
    up.id,
    up.user_id,
    u.Email AS user_email,
    u.FullName AS user_name,
    u.Role AS user_role,
    p.name AS package_name,
    p.display_name AS package_display_name,
    up.status,
    up.start_at,
    up.end_at,
    up.boost_used_today,
    DATEDIFF(up.end_at, NOW()) AS days_remaining,
    CASE 
        WHEN up.end_at < NOW() THEN 'Hết hạn'
        WHEN DATEDIFF(up.end_at, NOW()) <= 7 THEN 'Sắp hết hạn'
        ELSE 'Hoạt động'
    END AS status_description
FROM user_packages up
LEFT JOIN users u ON up.user_id = u.UserID
LEFT JOIN packages p ON up.package_id = p.id
WHERE up.status = 'active'
ORDER BY up.end_at ASC;

-- 4. Đếm số lượng users theo từng package
SELECT 
    p.name AS package_name,
    p.display_name,
    COUNT(up.id) AS total_users,
    COUNT(CASE WHEN up.status = 'active' AND up.end_at >= NOW() THEN 1 END) AS active_users,
    COUNT(CASE WHEN up.status = 'expired' OR up.end_at < NOW() THEN 1 END) AS expired_users
FROM packages p
LEFT JOIN user_packages up ON p.id = up.package_id
GROUP BY p.id, p.name, p.display_name
ORDER BY 
    CASE p.name
        WHEN 'FREE' THEN 1
        WHEN 'PRO' THEN 2
        WHEN 'PREMIUM' THEN 3
        ELSE 4
    END;

-- 5. Xem users đang dùng gói PRO hoặc PREMIUM
SELECT 
    u.UserID,
    u.Email,
    u.FullName,
    u.Role,
    p.name AS current_package,
    p.display_name AS package_display_name,
    up.start_at AS package_started,
    up.end_at AS package_expires,
    DATEDIFF(up.end_at, NOW()) AS days_left,
    up.boost_used_today AS boosts_used_today
FROM users u
INNER JOIN user_packages up ON u.UserID = up.user_id
INNER JOIN packages p ON up.package_id = p.id
WHERE up.status = 'active' 
    AND up.end_at >= NOW()
    AND p.name IN ('PRO', 'PREMIUM')
ORDER BY p.name, up.end_at;

-- 6. Xem users đang dùng gói FREE (không có trong user_packages)
SELECT 
    u.UserID,
    u.Email,
    u.FullName,
    u.Role,
    'FREE' AS current_package,
    'Gói Miễn Phí' AS package_display_name,
    NULL AS package_started,
    NULL AS package_expires,
    NULL AS days_left
FROM users u
WHERE u.UserID NOT IN (
    SELECT DISTINCT user_id 
    FROM user_packages 
    WHERE status = 'active' AND end_at >= NOW()
)
ORDER BY u.UserID;

-- 7. Kiểm tra payment transactions liên quan đến packages
SELECT 
    pt.id,
    pt.user_id,
    u.Email AS user_email,
    pt.package_name,
    pt.gateway,
    pt.status AS payment_status,
    pt.amount,
    pt.created_at AS payment_date,
    up.status AS package_status,
    up.end_at AS package_expires
FROM paymenttransaction pt
LEFT JOIN users u ON pt.user_id = u.UserID
LEFT JOIN user_packages up ON pt.user_id = up.user_id 
    AND pt.package_name = (SELECT name FROM packages WHERE id = up.package_id)
WHERE pt.package_name IS NOT NULL
ORDER BY pt.created_at DESC
LIMIT 20;

-- 8. Tổng hợp thống kê packages
SELECT 
    'Tổng số packages' AS metric,
    COUNT(*) AS value
FROM packages
UNION ALL
SELECT 
    'Tổng số user packages',
    COUNT(*) 
FROM user_packages
UNION ALL
SELECT 
    'User packages đang active',
    COUNT(*) 
FROM user_packages 
WHERE status = 'active' AND end_at >= NOW()
UNION ALL
SELECT 
    'User packages đã hết hạn',
    COUNT(*) 
FROM user_packages 
WHERE status = 'expired' OR end_at < NOW()
UNION ALL
SELECT 
    'Users đang dùng PRO',
    COUNT(DISTINCT up.user_id)
FROM user_packages up
INNER JOIN packages p ON up.package_id = p.id
WHERE up.status = 'active' 
    AND up.end_at >= NOW()
    AND p.name = 'PRO'
UNION ALL
SELECT 
    'Users đang dùng PREMIUM',
    COUNT(DISTINCT up.user_id)
FROM user_packages up
INNER JOIN packages p ON up.package_id = p.id
WHERE up.status = 'active' 
    AND up.end_at >= NOW()
    AND p.name = 'PREMIUM';



