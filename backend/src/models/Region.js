/**
 * Region model
 * Schema from Section 2.2
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Region = sequelize.define('Region', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'countries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  }, {
    tableName: 'regions',
    timestamps: true,
  });

  return Region;
};
