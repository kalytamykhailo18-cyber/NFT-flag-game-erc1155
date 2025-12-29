'use strict';

const municipalityNames = {
  1: 'Madrid City',
  2: 'Alcala de Henares',
  3: 'Paris',
  4: 'Versailles',
  5: 'Munich',
  6: 'Nuremberg',
  7: 'Rome',
  8: 'Tivoli',
};

module.exports = {
  async up(queryInterface) {
    const places = [];
    let placeId = 1;
    let tokenIdBase = 1000;

    // 8 places per municipality, 8 municipalities = 64 places
    for (let municipalityId = 1; municipalityId <= 8; municipalityId++) {
      for (let i = 1; i <= 8; i++) {
        const tokenId = tokenIdBase + placeId;
        const munName = municipalityNames[municipalityId];

        places.push({
          id: placeId,
          token_id: tokenId,
          municipality_id: municipalityId,
          name: `${munName} Location ${i}`,
          address: `${i * 100} Main Street, ${munName}`,
          latitude: null,
          longitude: null,
          location_type: 'landmark',
          category: 'standard',
          price: 0.01,
          pair_count: 2 + (i % 3), // 2, 3, or 4 pairs
          base_image_uri: null,
          metadata_uri: null,
          metadata_hash: null,
          is_minted: false,
          is_claimed: false,
          claimed_by: null,
          claimed_at: null,
          claim_tx_hash: null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        placeId++;
      }
    }

    await queryInterface.bulkInsert('places', places);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('places', null, {});
  },
};
