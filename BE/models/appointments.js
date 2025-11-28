const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appointments', {
    AppointmentID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    BuyerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    SellerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    BuyerDates: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Danh sách ngày buyer chọn'
    },
    SellerDates: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Danh sách ngày seller chọn'
    },
    Status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    Notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appointments',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "AppointmentID" },
        ]
      },
      {
        name: "BuyerID",
        using: "BTREE",
        fields: [
          { name: "BuyerID" },
        ]
      },
      {
        name: "SellerID",
        using: "BTREE",
        fields: [
          { name: "SellerID" },
        ]
      },
    ]
  });
};

