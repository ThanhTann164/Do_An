const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('iotcontrollogs', {
    ControlID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã lệnh điều khiển"
    },
    DeviceID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Thiết bị được điều khiển",
      references: {
        model: 'iotdevices',
        key: 'DeviceID'
      }
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người thực hiện điều khiển",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Hành động"
    },
    Parameters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Tham số điều khiển"
    },
    SentToKafka: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
      comment: "Có gửi Kafka không"
    }
  }, {
    sequelize,
    tableName: 'iotcontrollogs',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ControlID" },
        ]
      },
      {
        name: "idx_logs_device",
        using: "BTREE",
        fields: [
          { name: "DeviceID" },
        ]
      },
      {
        name: "idx_logs_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
