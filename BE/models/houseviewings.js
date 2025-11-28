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
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người đặt lịch xem",
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
    },
    VerifyCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Mã xác minh buổi xem nhà (OTP\/QR)"
    },
    VerifiedByAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Admin xác nhận hợp lệ"
    },
    VerifiedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm xác minh thực tế"
    },
    SuspiciousFlag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Đánh dấu nghi ngờ giao dịch ngoài sàn"
    },
    StaffID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "Nhan vien ho tro xem nha",
      references: {
        model: 'users',
        key: 'UserID'
      }
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
        name: "idx_viewings_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
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
      {
        name: "fk_viewing_staff",
        using: "BTREE",
        fields: [
          { name: "StaffID" },
        ]
      },
    ]
  });
};
