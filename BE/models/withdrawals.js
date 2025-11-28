const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('withdrawals', {
    WithdrawalID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    SellerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    TransactionID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'TransactionID'
      }
    },
    Amount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false
    },
    Status: {
      type: DataTypes.ENUM('Pending','Processing','Completed','Failed'),
      allowNull: true,
      defaultValue: "Pending"
    },
    RequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    ProcessedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'withdrawals',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "WithdrawalID" },
        ]
      },
      {
        name: "SellerID",
        using: "BTREE",
        fields: [
          { name: "SellerID" },
        ]
      },
      {
        name: "TransactionID",
        using: "BTREE",
        fields: [
          { name: "TransactionID" },
        ]
      },
    ]
  });
};
