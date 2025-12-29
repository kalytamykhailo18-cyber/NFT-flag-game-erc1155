'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlacePhotoSlice = sequelize.define('PlacePhotoSlice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pair_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slice_position: {
      type: DataTypes.ENUM('left', 'right'),
      allowNull: false,
    },
    image_uri: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_owned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    owned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0.005,
    },
    tx_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
  }, {
    tableName: 'place_photo_slices',
    underscored: true,
    timestamps: true,
  });

  return PlacePhotoSlice;
};
