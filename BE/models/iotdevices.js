const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('iotdevices', {
    DeviceID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã thiết bị IoT"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Căn nhà sở hữu thiết bị",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    DeviceName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Tên thiết bị"
    },
    DeviceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Loại thiết bị"
    },
    Status: {
      type: DataTypes.ENUM('Active','Inactive'),
      allowNull: true,
      defaultValue: "Active",
      comment: "Trạng thái"
    }
  }, {
    sequelize,
    tableName: 'iotdevices',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "DeviceID" },
        ]
      },
      {
        name: "idx_iotdevices_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_iotdevices_type",
        using: "BTREE",
        fields: [
          { name: "DeviceType" },
        ]
      },
    ]
  });
};
