/**
 * Auction model
 * Schema from Section 2.8
 */
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
      references: {
        model: 'places',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    final_price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
  }, {
    tableName: 'auctions',
    timestamps: true,
  });

  return Auction;
};
