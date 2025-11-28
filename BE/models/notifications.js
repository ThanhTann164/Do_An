const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifications', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Tiêu đề thông báo"
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Nội dung thông báo"
    },
    type: {
      type: DataTypes.ENUM('system', 'promotion', 'maintenance', 'custom'),
      allowNull: true,
      defaultValue: 'system',
      comment: "Loại thông báo"
    },
    receiverId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "ID người nhận (NULL = gửi toàn hệ thống)",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    toUserId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "Legacy field - sử dụng receiverId thay thế",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: "Trạng thái đã đọc"
    }
  }, {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_receiverId",
        using: "BTREE",
        fields: [
          { name: "receiverId" },
        ]
      },
      {
        name: "idx_toUserId",
        using: "BTREE",
        fields: [
          { name: "toUserId" },
        ]
      },
      {
        name: "idx_createdAt",
        using: "BTREE",
        fields: [
          { name: "createdAt" },
        ]
      },
      {
        name: "idx_isRead",
        using: "BTREE",
        fields: [
          { name: "isRead" },
        ]
      },
      {
        name: "idx_type",
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      }
    ]
  });
};

