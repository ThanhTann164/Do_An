const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('houses', {
    HouseID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã nhà"
    },
    OwnerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người sở hữu (tham chiếu Users.UserID)",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Tiêu đề bài đăng bán nhà"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mô tả chi tiết về căn nhà"
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Địa chỉ cụ thể của căn nhà"
    },
    HouseType: {
      type: DataTypes.ENUM('Apartment','Townhouse','Villa','Land','Other'),
      allowNull: true,
      defaultValue: "Apartment",
      comment: "Loại nhà"
    },
    Price: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false,
      comment: "Giá bán của nhà"
    },
    Bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Area: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    Status: {
      type: DataTypes.ENUM('Available','Pending','Sold'),
      allowNull: true,
      defaultValue: "Available",
      comment: "Trạng thái"
    },
    DriveFolderID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ID folder trên Google Drive chứa tất cả ảnh của nhà"
    },
    Orientation: {
      type: DataTypes.ENUM('Đông','Tây','Nam','Bắc','Đông-Bắc','Đông-Nam','Tây-Bắc','Tây-Nam'),
      allowNull: true,
      defaultValue: "Đông",
      comment: "Hướng nhà"
    }
  }, {
    sequelize,
    tableName: 'houses',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_houses_owner",
        using: "BTREE",
        fields: [
          { name: "OwnerID" },
        ]
      },
      {
        name: "idx_houses_type",
        using: "BTREE",
        fields: [
          { name: "HouseType" },
        ]
      },
      {
        name: "idx_houses_price",
        using: "BTREE",
        fields: [
          { name: "Price" },
        ]
      },
      {
        name: "idx_houses_status",
        using: "BTREE",
        fields: [
          { name: "Status" },
        ]
      },
    ]
  });
};
