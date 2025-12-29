'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add 'completed' to the ENUM
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_auctions_status ADD VALUE IF NOT EXISTS 'completed'`
    );

    // Step 2: Update any existing 'ended' status to 'completed'
    await queryInterface.sequelize.query(
      `UPDATE auctions SET status = 'completed' WHERE status = 'ended'`
    );

    // Step 3: Remove 'ended' from the ENUM (requires recreating the type)
    // This is complex in PostgreSQL, so we'll leave 'ended' in the ENUM for backwards compatibility
    // but it won't be used anymore
  },

  async down(queryInterface, Sequelize) {
    // Revert completed back to ended
    await queryInterface.sequelize.query(
      `UPDATE auctions SET status = 'ended' WHERE status = 'completed'`
    );
  }
};
