const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ratings', {
    RatingID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã đánh giá"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Nhà được đánh giá",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người đánh giá",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Điểm đánh giá (1-5 sao)"
    },
    Comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Nhận xét"
    }
  }, {
    sequelize,
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RatingID" },
        ]
      },
      {
        name: "idx_ratings_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_ratings_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
