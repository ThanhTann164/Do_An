const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('commissions', {
    CommissionID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    TransactionID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'TransactionID'
      }
    },
    CommissionRate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    CommissionAmount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false
    },
    PaidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsDeducted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Đã khấu trừ phí sàn khi giải ngân chưa"
    }
  }, {
    sequelize,
    tableName: 'commissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CommissionID" },
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
