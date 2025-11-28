const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    TransactionID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã giao dịch"
    },
    BuyerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người mua",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Căn nhà được mua",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    Amount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false,
      comment: "Số tiền giao dịch"
    },
    Status: {
      type: DataTypes.ENUM('Pending','Completed','Cancelled'),
      allowNull: true,
      defaultValue: "Pending",
      comment: "Trạng thái"
    },
    PaymentMethod: {
      type: DataTypes.ENUM('Bank','CreditCard','EWallet'),
      allowNull: false
    },
    coIsPaidToEscrow: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Buyer đã nộp cọc vào sàn chưa"
    },
    IsReleasedToSeller: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Tiền đã giải ngân cho Seller chưa"
    },
    ReleasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm giải ngân cho Seller"
    },
    StaffID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "Nhan vien xu ly giao dich",
      references: {
        model: 'users',
        key: 'UserID'
      }
    }
  }, {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "TransactionID" },
        ]
      },
      {
        name: "idx_trans_buyer",
        using: "BTREE",
        fields: [
          { name: "BuyerID" },
        ]
      },
      {
        name: "idx_trans_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_trans_status",
        using: "BTREE",
        fields: [
          { name: "Status" },
        ]
      },
      {
        name: "fk_transaction_staff",
        using: "BTREE",
        fields: [
          { name: "StaffID" },
        ]
      },
    ]
  });
};
