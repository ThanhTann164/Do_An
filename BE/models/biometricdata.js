const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('biometricdata', {
    BiometricID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã sinh trắc học"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người dùng sở hữu dữ liệu",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    BiometricType: {
      type: DataTypes.ENUM('Face','Fingerprint'),
      allowNull: true,
      comment: "Loại sinh trắc học"
    },
    BiometricHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Hash dữ liệu sinh trắc học"
    }
  }, {
    sequelize,
    tableName: 'biometricdata',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "BiometricID" },
        ]
      },
      {
        name: "idx_bio_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
