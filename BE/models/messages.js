const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    MessageID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    ConversationID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'ConversationID'
      }
    },
    SenderID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    MessageText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    MessageType: {
      type: DataTypes.ENUM('text', 'image', 'property_link'),
      allowNull: true,
      defaultValue: 'text'
    },
    Metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    IsEncrypted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MessageID" },
        ]
      },
      {
        name: "idx_conversation",
        using: "BTREE",
        fields: [
          { name: "ConversationID" },
        ]
      },
      {
        name: "idx_sender",
        using: "BTREE",
        fields: [
          { name: "SenderID" },
        ]
      }
    ]
  });
};
