'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('countries', [
      { id: 1, name: 'Spain', code: 'ES', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'France', code: 'FR', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Germany', code: 'DE', created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'Italy', code: 'IT', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('countries', null, {});
  },
};
