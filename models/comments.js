const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comments', {
    CommentID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Khóa chính - mã comment"
    },
    HouseID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Nhà được bình luận",
      references: {
        model: 'houses',
        key: 'HouseID'
      }
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người viết comment",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Nội dung bình luận"
    },
    ParentCommentID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: "Nếu là trả lời thì tham chiếu comment gốc",
      references: {
        model: 'comments',
        key: 'CommentID'
      }
    }
  }, {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CommentID" },
        ]
      },
      {
        name: "idx_comments_house",
        using: "BTREE",
        fields: [
          { name: "HouseID" },
        ]
      },
      {
        name: "idx_comments_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
      {
        name: "idx_comments_parent",
        using: "BTREE",
        fields: [
          { name: "ParentCommentID" },
        ]
      },
    ]
  });
};
