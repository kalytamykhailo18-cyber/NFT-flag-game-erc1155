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
    starting_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    current_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    min_increment: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0.001,
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
      type: DataTypes.ENUM('active', 'ended', 'cancelled'),
      defaultValue: 'active',
    },
    winner_id: {
      type: DataTypes.INTEGER,
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
