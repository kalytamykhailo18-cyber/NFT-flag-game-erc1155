/**
 * Municipality model
 * Schema from Section 2.3
 */
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
      references: {
        model: 'regions',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    timestamps: true,
  });

  return Municipality;
};
