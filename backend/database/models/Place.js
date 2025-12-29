'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Place = sequelize.define('Place', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    municipality_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    location_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('standard', 'plus', 'premium'),
      defaultValue: 'standard',
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0.01,
    },
    pair_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    base_image_uri: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata_uri: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    is_minted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_claimed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    claimed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claim_tx_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
  }, {
    tableName: 'places',
    underscored: true,
    timestamps: true,
  });

  return Place;
};
