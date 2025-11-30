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
    },
    PriorityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Điểm ưu tiên để sort: 1=Free, 2=Pro, 3=Premium"
    },
    IsBoosted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Tin đang được boost"
    },
    BoostExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời gian hết hạn boost"
    },
    TierLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Cấp độ gói: 1=Free, 2=Pro, 3=Premium"
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
      {
        name: "idx_houses_priority_score",
        using: "BTREE",
        fields: [
          { name: "PriorityScore" },
        ]
      },
      {
        name: "idx_houses_is_boosted",
        using: "BTREE",
        fields: [
          { name: "IsBoosted" },
        ]
      },
      {
        name: "idx_houses_boost_expires_at",
        using: "BTREE",
        fields: [
          { name: "BoostExpiresAt" },
        ]
      },
      {
        name: "idx_houses_tier_level",
        using: "BTREE",
        fields: [
          { name: "TierLevel" },
        ]
      },
    ]
  });
};
