const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userverifications', {
    VerificationID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã xác thực"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người cần xác thực",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    VerificationType: {
      type: DataTypes.ENUM('Email','Phone'),
      allowNull: true,
      comment: "Loại xác thực"
    },
    VerificationCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Mã OTP"
    },
    ExpiredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời gian hết hạn"
    },
    IsVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Đã xác minh chưa"
    }
  }, {
    sequelize,
    tableName: 'userverifications',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "VerificationID" },
        ]
      },
      {
        name: "idx_verify_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "idx_verify_type",
        using: "BTREE",
        fields: [
          { name: "VerificationType" },
        ]
      },
    ]
  });
};
