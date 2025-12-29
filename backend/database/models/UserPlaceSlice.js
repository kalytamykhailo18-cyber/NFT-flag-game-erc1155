'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPlaceSlice = sequelize.define('UserPlaceSlice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    tx_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
  }, {
    tableName: 'user_place_slices',
    underscored: true,
    timestamps: true,
  });

  return UserPlaceSlice;
};
