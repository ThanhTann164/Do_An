const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('houseimages', {
    ImageID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã ảnh"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Nhà liên quan",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    FileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Tên file gốc"
    },
    CloudPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Đường dẫn cloud"
    },
    IsCover: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      comment: "Ảnh đại diện"
    },
    UploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Ngày giờ upload"
    },
    DriveFileID: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "File ID trên Google Drive"
    }
  }, {
    sequelize,
    tableName: 'houseimages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ImageID" },
        ]
      },
      {
        name: "idx_images_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_images_cover",
        using: "BTREE",
        fields: [
          { name: "IsCover" },
        ]
      },
    ]
  });
};
