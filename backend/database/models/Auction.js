'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auction = sequelize.define('Auction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    min_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    max_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'ended', 'cancelled', 'completed'),
      defaultValue: 'active',
    },
    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    final_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    tx_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
  }, {
    tableName: 'auctions',
    underscored: true,
    timestamps: true,
  });

  return Auction;
};
