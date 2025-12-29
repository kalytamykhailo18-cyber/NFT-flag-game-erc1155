'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        wallet_address: '0x1234567890123456789012345678901234567890',
        username: 'Demo User Standard',
        category: 'standard',
        total_slices_owned: 0,
        total_places_claimed: 0,
        reputation_score: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        wallet_address: '0x2234567890123456789012345678901234567890',
        username: 'Demo User Plus',
        category: 'plus',
        total_slices_owned: 0,
        total_places_claimed: 0,
        reputation_score: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        wallet_address: '0x3234567890123456789012345678901234567890',
        username: 'Demo User Premium',
        category: 'premium',
        total_slices_owned: 0,
        total_places_claimed: 0,
        reputation_score: 100,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
