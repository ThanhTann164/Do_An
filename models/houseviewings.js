const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('houseviewings', {
    ViewingID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã lịch xem"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Nhà muốn xem",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    BuyerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người đặt lịch xem (Buyer)",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    SellerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người bán (Seller/Owner)",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    ViewingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Ngày giờ hẹn xem"
    },
    Status: {
      type: DataTypes.ENUM('PENDING','CONFIRMED','CANCELLED'),
      allowNull: true,
      defaultValue: "PENDING",
      comment: "Trạng thái"
    }
  }, {
    sequelize,
    tableName: 'houseviewings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ViewingID" },
        ]
      },
      {
        name: "idx_viewings_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_viewings_buyer",
        using: "BTREE",
        fields: [
          { name: "BuyerID" },
        ]
      },
      {
        name: "idx_viewings_seller",
        using: "BTREE",
        fields: [
          { name: "SellerID" },
        ]
      },
      {
        name: "idx_viewings_status",
        using: "BTREE",
        fields: [
          { name: "Status" },
        ]
      },
      {
        name: "idx_viewings_date",
        using: "BTREE",
        fields: [
          { name: "ViewingDate" },
        ]
      },
    ]
  });
};
