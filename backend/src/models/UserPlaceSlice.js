/**
 * UserPlaceSlice model
 * Schema from Section 2.7
 * Tracks which slices a user has purchased
 */
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
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    slice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'place_photo_slices',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'slice_id'],
      },
    ],
  });

  return UserPlaceSlice;
};
