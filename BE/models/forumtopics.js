const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('forumtopics', {
    TopicID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      comment: "Mã chủ đề"
    },
    Title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Tiêu đề chủ đề"
    },
    Content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Nội dung mở đầu"
    },
    UserID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Người tạo",
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Số lượt xem"
    }
  }, {
    sequelize,
    tableName: 'forumtopics',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "TopicID" },
        ]
      },
      {
        name: "idx_forum_user",
        using: "BTREE",
        fields: [
          { name: "UserID" },
        ]
      },
    ]
  });
};
