/**
 * User model
 * Schema from Section 2.6
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wallet_address: {
      type: DataTypes.STRING(42),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('standard', 'plus', 'premium'),
      allowNull: false,
      defaultValue: 'standard',
    },
    total_slices_owned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_places_claimed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reputation_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  return User;
};
