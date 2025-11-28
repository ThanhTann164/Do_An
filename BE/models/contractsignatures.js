const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contractsignatures', {
    SignatureID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã chữ ký"
    },
    ContractID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Hợp đồng được ký",
      references: {
        model: 'contracts',
        key: 'ContractID'
      }
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người ký hợp đồng",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    CertificateID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Chứng thư số dùng để ký",
      references: {
        model: 'digitalcertificates',
        key: 'CertificateID'
      }
    },
    SignatureHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Hash chữ ký số"
    },
    SignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Thời điểm ký"
    },
    TargetType: {
      type: DataTypes.ENUM('Contract','UserDocument','OwnershipDocument'),
      allowNull: false,
      defaultValue: "Contract"
    },
    TargetID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "ID của Contract\/UserDocument\/OwnershipDocument tuong ung"
    },
    SignedData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Dữ liệu gốc hoặc input hash đã ký"
    },
    VerifiedStatus: {
      type: DataTypes.ENUM('Pending','Valid','Invalid'),
      allowNull: true,
      defaultValue: "Pending",
      comment: "Kết quả xác minh"
    }
  }, {
    sequelize,
    tableName: 'contractsignatures',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "SignatureID" },
        ]
      },
      {
        name: "CertificateID",
        using: "BTREE",
        fields: [
          { name: "CertificateID" },
        ]
      },
      {
        name: "idx_sign_contract",
        using: "BTREE",
        fields: [
          { name: "ContractID" },
        ]
      },
      {
        name: "idx_sign_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
