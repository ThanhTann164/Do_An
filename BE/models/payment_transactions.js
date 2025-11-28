const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const PaymentTransaction = sequelize.define('payment_transactions', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID',
      },
    },
    gateway: {
      type: DataTypes.ENUM('momo', 'vnpay', 'zalopay'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    package_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    raw_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'fail'),
      allowNull: false,
      defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    tableName: 'payment_transactions',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
      {
        name: 'idx_payment_user',
        using: 'BTREE',
        fields: [{ name: 'user_id' }],
      },
      {
        name: 'idx_payment_gateway',
        using: 'BTREE',
        fields: [{ name: 'gateway' }],
      },
      {
        name: 'idx_payment_transaction_id',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'transaction_id' }],
      },
    ],
  });

  return PaymentTransaction;
};


