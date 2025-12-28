/**
 * PlacePhotoSlice model
 * Schema from Section 2.5
 * Photo subdivisions for each place
 */
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
      references: {
        model: 'places',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    pair_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slice_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2]],
      },
    },
    slice_uri: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    image_sha256: {
      type: DataTypes.STRING(66),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    polygon_geojson: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    captured_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    zoom_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      defaultValue: 0.005,
    },
    is_owned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    owned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'place_photo_slices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['place_id', 'pair_number', 'slice_position'],
      },
    ],
  });

  return PlacePhotoSlice;
};
