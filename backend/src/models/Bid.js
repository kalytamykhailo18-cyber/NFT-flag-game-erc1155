/**
 * Bid model
 * Schema from Section 2.9
 */
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
      references: {
        model: 'auctions',
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
    amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
    },
    user_category: {
      type: DataTypes.ENUM('standard', 'plus', 'premium'),
      allowNull: false,
    },
  }, {
    tableName: 'bids',
    timestamps: true,
    updatedAt: false,
  });

  return Bid;
};
