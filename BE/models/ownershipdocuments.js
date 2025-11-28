const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ownershipdocuments', {
    DocumentID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    DocumentType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "SoDo, SoHong, GiayPhepXayDung..."
    },
    FilePath: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    FileHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Hash SHA-256 để kiểm tra toàn vẹn"
    },
    Status: {
      type: DataTypes.ENUM('Pending','Approved','Rejected'),
      allowNull: true,
      defaultValue: "Pending"
    },
    UploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    VerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
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
