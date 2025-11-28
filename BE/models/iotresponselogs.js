const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('iotresponselogs', {
    ResponseID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã phản hồi"
    },
    ControlLogID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Liên kết với lệnh gốc",
      references: {
        model: 'iotcontrollogs',
        key: 'ControlID'
      }
    },
    DeviceID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Thiết bị trả lời",
      references: {
        model: 'iotdevices',
        key: 'DeviceID'
      }
    },
    ResponseStatus: {
      type: DataTypes.ENUM('SUCCESS','FAILED','TIMEOUT'),
      allowNull: false,
      comment: "Kết quả phản hồi"
    },
    ResponseMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Chi tiết phản hồi"
    },
    ReceivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Thời điểm nhận"
    }
  }, {
    sequelize,
    tableName: 'iotresponselogs',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ResponseID" },
        ]
      },
      {
        name: "idx_reslog_control",
        using: "BTREE",
        fields: [
          { name: "ControlLogID" },
        ]
      },
      {
        name: "idx_reslog_device",
        using: "BTREE",
        fields: [
          { name: "DeviceID" },
        ]
      },
    ]
  });
};
