'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Municipality = sequelize.define('Municipality', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
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
  }, {
    tableName: 'municipalities',
    underscored: true,
    timestamps: true,
  });

  return Municipality;
};
