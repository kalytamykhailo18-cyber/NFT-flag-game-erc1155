'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First get all places to know their pair_count, category, and base_image_uri
    const places = await queryInterface.sequelize.query(
      'SELECT id, pair_count, category, base_image_uri FROM places ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const slices = [];
    let sliceId = 1;

    for (const place of places) {
      // Extract IPFS hash from base_image_uri (format: ipfs://QmXXXXX...)
      const baseImageHash = place.base_image_uri ? place.base_image_uri.replace('ipfs://', '') : null;

      // Calculate price based on category
      let slicePrice = 0.005; // standard
      if (place.category === 'plus') {
        slicePrice = 0.007;
      } else if (place.category === 'premium') {
        slicePrice = 0.01;
      }

      for (let pairNum = 1; pairNum <= place.pair_count; pairNum++) {
        // Left slice - use base image hash as slice URI
        slices.push({
          id: sliceId++,
          place_id: place.id,
          pair_number: pairNum,
          slice_position: 'left',
          slice_uri: baseImageHash ? `ipfs://${baseImageHash}` : `ipfs://placeholder/place_${place.id}_pair${pairNum}_left.jpg`,
          image_sha256: null,
          latitude: null,
          longitude: null,
          polygon_geojson: null,
          captured_at: new Date(),
          sequence: (pairNum - 1) * 2,
          zoom_level: 15,
          price: slicePrice,
          is_owned: false,
          owned_by: null,
          owned_at: null,
          tx_hash: null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Right slice - use base image hash as slice URI
        slices.push({
          id: sliceId++,
          place_id: place.id,
          pair_number: pairNum,
          slice_position: 'right',
          slice_uri: baseImageHash ? `ipfs://${baseImageHash}` : `ipfs://placeholder/place_${place.id}_pair${pairNum}_right.jpg`,
          image_sha256: null,
          latitude: null,
          longitude: null,
          polygon_geojson: null,
          captured_at: new Date(),
          sequence: (pairNum - 1) * 2 + 1,
          zoom_level: 15,
          price: slicePrice,
          is_owned: false,
          owned_by: null,
          owned_at: null,
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
