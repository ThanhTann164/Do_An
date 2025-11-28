const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('auditlogs', {
    LogID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã log"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "Người thực hiện hành động",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Tên hành động"
    },
    Details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Chi tiết hành động"
    }
  }, {
    sequelize,
    tableName: 'auditlogs',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "LogID" },
        ]
      },
      {
        name: "idx_audit_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "idx_audit_action",
        using: "BTREE",
        fields: [
          { name: "Action" },
        ]
      },
    ]
  });
};
