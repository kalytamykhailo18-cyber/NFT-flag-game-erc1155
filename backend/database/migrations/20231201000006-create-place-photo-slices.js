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
      slice_uri: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      image_sha256: {
        type: Sequelize.STRING(66),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      polygon_geojson: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      captured_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      zoom_level: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        defaultValue: 0.005,
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
