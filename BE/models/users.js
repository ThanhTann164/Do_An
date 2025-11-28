const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    UserID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - định danh duy nhất cho mỗi người dùng"
    },
    FullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Họ và tên đầy đủ của người dùng"
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Email duy nhất, dùng để login \/ xác thực",
      unique: "Email"
    },
    PhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Số điện thoại duy nhất, dùng để login \/ xác thực",
      unique: "PhoneNumber"
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Mật khẩu đã băm để lưu trữ an toàn"
    },
    Role: {
      type: DataTypes.ENUM('Admin','Buyer','Seller','Staff'),
      allowNull: true,
      defaultValue: "Buyer",
      comment: "Phân quyền hệ thống"
    },
    Status: {
      type: DataTypes.ENUM('Active','Inactive','Banned'),
      allowNull: true,
      defaultValue: "Active",
      comment: "Trạng thái tài khoản"
    },
    OtpCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    OtpExpiredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Gender: {
      type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
      allowNull: true,
      comment: "Giới tính của người dùng"
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Địa chỉ của người dùng"
    },
    Timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "GMT+7 (ICT)",
      comment: "Múi giờ"
    },
    Website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Website cá nhân"
    },
    Bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú cá nhân"
    },
    AvatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "URL avatar của người dùng"
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "Email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Email" },
        ]
      },
      {
        name: "PhoneNumber",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PhoneNumber" },
        ]
      },
      {
        name: "idx_users_email",
        using: "BTREE",
        fields: [
          { name: "Email" },
        ]
      },
      {
        name: "idx_users_phone",
        using: "BTREE",
        fields: [
          { name: "PhoneNumber" },
        ]
      },
      {
        name: "idx_users_role",
        using: "BTREE",
        fields: [
          { name: "Role" },
        ]
      },
      {
        name: "idx_users_status",
        using: "BTREE",
        fields: [
          { name: "Status" },
        ]
      },
    ]
  });
};
