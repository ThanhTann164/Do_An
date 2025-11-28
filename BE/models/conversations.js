const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conversations', {
    ConversationID: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    Participant1ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    Participant2ID: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserID'
      }
    },
    LastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ConversationID" },
        ]
      },
      {
        name: "idx_participant1",
        using: "BTREE",
        fields: [
          { name: "Participant1ID" },
        ]
      },
      {
        name: "idx_participant2",
        using: "BTREE",
        fields: [
          { name: "Participant2ID" },
        ]
      }
    ]
  });
};
