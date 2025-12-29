'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get users
    const users = await queryInterface.sequelize.query(
      'SELECT id, wallet_address FROM users ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Get some slices from the first few places
    const slices = await queryInterface.sequelize.query(
      'SELECT id, place_id, pair_number, slice_position, price FROM place_photo_slices WHERE place_id IN (1, 2, 3) ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || slices.length === 0) {
      console.log('No users or slices found to seed UserPlaceSlices');
      return;
    }

    const userPlaceSlices = [];

    // Standard user (user[0]) - owns a few random slices from place 1
    if (users.length > 0) {
      const place1Slices = slices.filter(s => s.place_id === 1).slice(0, 3);
      place1Slices.forEach((slice) => {
        userPlaceSlices.push({
          user_id: users[0].id,
          place_id: slice.place_id,
          slice_id: slice.id,
          purchased_at: new Date(),
          purchase_price: slice.price,
          tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }

    // Plus user (user[1]) - owns complete pair 1 from place 2
    if (users.length > 1) {
      const place2Pair1 = slices.filter(s => s.place_id === 2 && s.pair_number === 1);
      place2Pair1.forEach((slice) => {
        userPlaceSlices.push({
          user_id: users[1].id,
          place_id: slice.place_id,
          slice_id: slice.id,
          purchased_at: new Date(),
          purchase_price: slice.price,
          tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }

    // Premium user (user[2]) - owns all slices from place 3 (complete)
    if (users.length > 2) {
      const place3Slices = slices.filter(s => s.place_id === 3);
      place3Slices.forEach((slice) => {
        userPlaceSlices.push({
          user_id: users[2].id,
          place_id: slice.place_id,
          slice_id: slice.id,
          purchased_at: new Date(),
          purchase_price: slice.price,
          tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    }

    if (userPlaceSlices.length > 0) {
      await queryInterface.bulkInsert('user_place_slices', userPlaceSlices);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_place_slices', null, {});
  },
};
