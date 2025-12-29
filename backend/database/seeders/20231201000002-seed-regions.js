'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('regions', [
      { id: 1, country_id: 1, name: 'Madrid', created_at: new Date(), updated_at: new Date() },
      { id: 2, country_id: 2, name: 'Île-de-France', created_at: new Date(), updated_at: new Date() },
      { id: 3, country_id: 3, name: 'Bavaria', created_at: new Date(), updated_at: new Date() },
      { id: 4, country_id: 4, name: 'Lazio', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('regions', null, {});
  },
};
