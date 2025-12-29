'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Interest = sequelize.define('Interest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'interests',
    underscored: true,
    timestamps: true,
  });

  return Interest;
};
