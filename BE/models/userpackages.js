const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const UserPackage = sequelize.define('userpackages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active','expired','cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    boost_used_today: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_boost_reset: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'user_packages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "package_id",
        using: "BTREE",
        fields: [
          { name: "package_id" },
        ]
      },
    ]
  });

  // Add instance method to check if package is expired
  UserPackage.prototype.isExpired = function() {
    if (!this.expires_at) {
      return false; // No expiration date means it doesn't expire
    }
    return new Date() > new Date(this.expires_at);
  };

  return UserPackage;
};
