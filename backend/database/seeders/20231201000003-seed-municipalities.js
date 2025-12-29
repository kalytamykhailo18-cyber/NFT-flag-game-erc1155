'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('municipalities', [
      // Spain - Madrid region
      { id: 1, region_id: 1, name: 'Madrid City', latitude: 40.4168, longitude: -3.7038, created_at: new Date(), updated_at: new Date() },
      { id: 2, region_id: 1, name: 'Alcala de Henares', latitude: 40.4819, longitude: -3.3635, created_at: new Date(), updated_at: new Date() },
      // France - Île-de-France region
      { id: 3, region_id: 2, name: 'Paris', latitude: 48.8566, longitude: 2.3522, created_at: new Date(), updated_at: new Date() },
      { id: 4, region_id: 2, name: 'Versailles', latitude: 48.8014, longitude: 2.1301, created_at: new Date(), updated_at: new Date() },
      // Germany - Bavaria region
      { id: 5, region_id: 3, name: 'Munich', latitude: 48.1351, longitude: 11.5820, created_at: new Date(), updated_at: new Date() },
      { id: 6, region_id: 3, name: 'Nuremberg', latitude: 49.4521, longitude: 11.0767, created_at: new Date(), updated_at: new Date() },
      // Italy - Lazio region
      { id: 7, region_id: 4, name: 'Rome', latitude: 41.9028, longitude: 12.4964, created_at: new Date(), updated_at: new Date() },
      { id: 8, region_id: 4, name: 'Tivoli', latitude: 41.9634, longitude: 12.7986, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('municipalities', null, {});
  },
};
