const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('digitalcertificates', {
    CertificateID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã chứng thư số"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người sở hữu chứng thư",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Provider: {
      type: DataTypes.ENUM('Viettel-CA','VNPT-CA','FPT-CA'),
      allowNull: true,
      comment: "Nhà cung cấp"
    },
    SerialNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Số serial chứng thư số",
      unique: "SerialNumber"
    },
    ValidFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Ngày hiệu lực"
    },
    ValidTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Ngày hết hạn"
    },
    Status: {
      type: DataTypes.ENUM('Active','Revoked','Expired'),
      allowNull: false,
      defaultValue: "Active"
    },
    PublicKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Khóa công khai (PEM)"
    },
    PrivateKeyEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Khóa bí mật (mã hóa, không giải mã trên DB)"
    }
  }, {
    sequelize,
    tableName: 'digitalcertificates',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CertificateID" },
        ]
      },
      {
        name: "SerialNumber",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "SerialNumber" },
        ]
      },
      {
        name: "idx_certs_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
