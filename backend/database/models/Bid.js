'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bid = sequelize.define('Bid', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bidder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    tx_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
  }, {
    tableName: 'bids',
    underscored: true,
    timestamps: true,
  });

  return Bid;
};
