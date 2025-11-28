const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ownershipdocuments', {
    DocumentID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã giấy tờ"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Căn nhà liên quan",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    DocumentType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Loại giấy tờ"
    },
    FilePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Đường dẫn file"
    },
    UploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Thời điểm upload"
    }
  }, {
    sequelize,
    tableName: 'ownershipdocuments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "DocumentID" },
        ]
      },
      {
        name: "idx_docs_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
    ]
  });
};
