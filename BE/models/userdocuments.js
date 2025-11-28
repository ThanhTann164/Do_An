const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userdocuments', {
    DocumentID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã giấy tờ"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người nộp giấy tờ",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    DocumentType: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    FileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Tên file gốc"
    },
    FilePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Đường dẫn file lưu trữ (cloud\/local, đã bảo mật)"
    },
    FileHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Hash SHA256 để kiểm tra tính toàn vẹn"
    },
    Status: {
      type: DataTypes.ENUM('Pending','Approved','Rejected'),
      allowNull: true,
      defaultValue: "Pending",
      comment: "Trạng thái xác minh"
    },
    UploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Thời điểm upload"
    },
    VerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm xác minh"
    },
    RequestID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'requests',
        key: 'RequestID'
      }
    }
  }, {
    sequelize,
    tableName: 'userdocuments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "DocumentID" },
        ]
      },
      {
        name: "uq_user_request_doc",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "UserID" },
          { name: "RequestID" },
          { name: "DocumentType" },
        ]
      },
      {
        name: "idx_doc_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "FK_UserDocuments_Request",
        using: "BTREE",
        fields: [
          { name: "RequestID" },
        ]
      },
    ]
  });
};
