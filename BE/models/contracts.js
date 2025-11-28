const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contracts', {
    ContractID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã hợp đồng"
    },
    TransactionID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'TransactionID'
      }
    },
    ContractContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Nội dung hợp đồng"
    },
    SignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Ngày giờ ký cuối cùng"
    },
    Status: {
      type: DataTypes.ENUM('Sent','BuyerSigned','AdminSigned','Completed','Cancelled'),
      allowNull: false,
      defaultValue: "Sent"
    },
    ContractType: {
      type: DataTypes.ENUM('Deposit','Sale','SellerUpgrade'),
      allowNull: false,
      defaultValue: "Deposit"
    }
  }, {
    sequelize,
    tableName: 'contracts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ContractID" },
        ]
      },
      {
        name: "idx_contracts_trans",
        using: "BTREE",
        fields: [
          { name: "TransactionID" },
        ]
      },
    ]
  });
};
