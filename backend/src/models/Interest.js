/**
 * Interest model
 * Schema from Section 2.10
 * Tracks user interest in places
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Interest = sequelize.define('Interest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'places',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'interests',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['place_id', 'user_id'],
      },
    ],
  });

  return Interest;
};
