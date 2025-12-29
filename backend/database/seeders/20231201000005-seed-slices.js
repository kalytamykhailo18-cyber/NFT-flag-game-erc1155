'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First get all places to know their pair_count
    const places = await queryInterface.sequelize.query(
      'SELECT id, pair_count FROM places ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const slices = [];
    let sliceId = 1;

    for (const place of places) {
      for (let pairNum = 1; pairNum <= place.pair_count; pairNum++) {
        // Left slice
        slices.push({
          id: sliceId++,
          place_id: place.id,
          pair_number: pairNum,
          slice_position: 'left',
          image_uri: `ipfs://placeholder/place_${place.id}_pair${pairNum}_left.jpg`,
          is_owned: false,
          owned_by: null,
          owned_at: null,
          price: 0.005,
          tx_hash: null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Right slice
        slices.push({
          id: sliceId++,
          place_id: place.id,
          pair_number: pairNum,
          slice_position: 'right',
          image_uri: `ipfs://placeholder/place_${place.id}_pair${pairNum}_right.jpg`,
          is_owned: false,
          owned_by: null,
          owned_at: null,
          price: 0.005,
          tx_hash: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('place_photo_slices', slices);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('place_photo_slices', null, {});
  },
};
