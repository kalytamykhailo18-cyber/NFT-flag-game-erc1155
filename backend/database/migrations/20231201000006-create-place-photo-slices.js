'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_photo_slices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'places',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pair_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      slice_position: {
        type: Sequelize.ENUM('left', 'right'),
        allowNull: false,
      },
      image_uri: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_owned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      owned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      owned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        defaultValue: 0.005,
      },
      tx_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('place_photo_slices', ['place_id', 'pair_number', 'slice_position'], {
      unique: true,
      name: 'unique_slice_per_pair',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('place_photo_slices');
  },
};
