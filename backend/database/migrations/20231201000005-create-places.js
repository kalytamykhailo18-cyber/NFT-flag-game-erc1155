'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      municipality_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipalities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(500),
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
      location_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM('standard', 'plus', 'premium'),
        defaultValue: 'standard',
      },
      price: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        defaultValue: 0.01,
      },
      pair_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      base_image_uri: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      metadata_uri: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      metadata_hash: {
        type: Sequelize.STRING(66),
        allowNull: true,
      },
      is_minted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_claimed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      claimed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      claimed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      claim_tx_hash: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('places');
  },
};
