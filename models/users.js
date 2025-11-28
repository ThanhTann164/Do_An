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
      type: DataTypes.ENUM('Admin','Moderator','Buyer','Seller'),
      allowNull: true,
      defaultValue: "Buyer",
      comment: "Phân quyền hệ thống"
    },
    Status: {
      type: DataTypes.ENUM('Active','Inactive','Banned'),
      allowNull: true,
      defaultValue: "Active",
      comment: "Trạng thái tài khoản"
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
