const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Package = sequelize.define('packages', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    daily_post: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    daily_boost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    max_posts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5
    },
    max_premium_posts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    max_images_per_post: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5
    },
    ai_tools: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    boost_features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    priority_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'packages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  // Add instance method to return public JSON
  Package.prototype.toPublicJSON = function() {
    return {
      id: this.id,
      name: this.name,
      display_name: this.display_name,
      price: parseFloat(this.price) || 0,
      duration_days: this.duration_days || 30,
      description: this.description || null,
      daily_post: this.daily_post,
      daily_boost: this.daily_boost,
      price: Number(this.price) || 0,
      max_posts: this.max_posts || null,
      max_premium_posts: this.max_premium_posts || null,
      max_images_per_post: this.max_images_per_post || 5,
      ai_tools: this.ai_tools || [],
      boost_features: this.boost_features || [],
      priority_level: this.priority_level || 1,
      is_active: this.is_active !== undefined ? this.is_active : true,
      features: this.features || []
    };
  };

  return Package;
};
