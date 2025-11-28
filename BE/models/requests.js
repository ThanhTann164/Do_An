const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('requests', {
    RequestID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã yêu cầu"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    BuyerID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người gửi yêu cầu (User)",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    RequestType: {
      type: DataTypes.ENUM('Rent','Buy','UpgradeToSeller'),
      allowNull: false
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Lời nhắn của người mua"
    },
    Status: {
      type: DataTypes.ENUM('Pending','Approved','Rejected','Cancelled'),
      allowNull: false,
      defaultValue: "Pending"
    },
    FolderId: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'requests',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RequestID" },
        ]
      },
      {
        name: "HouseID",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "BuyerID",
        using: "BTREE",
        fields: [
          { name: "BuyerID" },
        ]
      },
    ]
  });
};
