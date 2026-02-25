/**
 * @file 001-seed-data.js
 * @description Sequelize seeder to populate the database with initial data.
 * This directly translates the `data.sql` files for H2/HSQLDB into Sequelize bulkCreate operations.
 * It includes data for vets, specialties, pet types, owners, pets, and visits.
 * @author Google Senior Engineer
 */

'use strict';

module.exports = {
  /**
   * @function up
   * @description Seeds the database with initial data.
   * @param {object} queryInterface - The Sequelize QueryInterface object.
   * @param {object} Sequelize - The Sequelize module.
   * @returns {Promise<void>} A promise that resolves when all data is inserted.
   */
  up: async (queryInterface, Sequelize) => {
    // Insert vets
    await queryInterface.bulkInsert('vets', [
      { id: 1, first_name: 'James', last_name: 'Carter', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, first_name: 'Helen', last_name: 'Leary', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, first_name: 'Linda', last_name: 'Douglas', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, first_name: 'Rafael', last_name: 'Ortega', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, first_name: 'Henry', last_name: 'Stevens', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, first_name: 'Sharon', last_name: 'Jenkins', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true }); // Use ignoreDuplicates to mimic "INSERT IGNORE" or "ON CONFLICT DO NOTHING"

    // Insert specialties
    await queryInterface.bulkInsert('specialties', [
      { id: 1, name: 'radiology', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'surgery', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'dentistry', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Insert vet_specialties associations
    await queryInterface.bulkInsert('vet_specialties', [
      { vet_id: 2, specialty_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { vet_id: 3, specialty_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { vet_id: 3, specialty_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { vet_id: 4, specialty_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { vet_id: 5, specialty_id: 1, createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Insert types (pet types)
    await queryInterface.bulkInsert('types', [
      { id: 1, name: 'cat', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'dog', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'lizard', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'snake', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'bird', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'hamster', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Insert owners
    await queryInterface.bulkInsert('owners', [
      { id: 1, first_name: 'George', last_name: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, first_name: 'Betty', last_name: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, first_name: 'Eduardo', last_name: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, first_name: 'Harold', last_name: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, first_name: 'Peter', last_name: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, first_name: 'Jean', last_name: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, first_name: 'Jeff', last_name: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, first_name: 'Maria', last_name: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683', createdAt: new Date(), updatedAt: new Date() },
      { id: 9, first_name: 'David', last_name: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, first_name: 'Carlos', last_name: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Insert pets
    await queryInterface.bulkInsert('pets', [
      { id: 1, name: 'Leo', birth_date: '2010-09-07', type_id: 1, owner_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Basil', birth_date: '2012-08-06', type_id: 6, owner_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Rosy', birth_date: '2011-04-17', type_id: 2, owner_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Jewel', birth_date: '2010-03-07', type_id: 2, owner_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Iggy', birth_date: '2010-11-30', type_id: 3, owner_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'George', birth_date: '2010-01-20', type_id: 4, owner_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Samantha', birth_date: '2012-09-04', type_id: 1, owner_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Max', birth_date: '2012-09-04', type_id: 1, owner_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: 'Lucky', birth_date: '2011-08-06', type_id: 5, owner_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: 'Mulligan', birth_date: '2007-02-24', type_id: 2, owner_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { id: 11, name: 'Freddy', birth_date: '2010-03-09', type_id: 5, owner_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { id: 12, name: 'Lucky', birth_date: '2010-06-24', type_id: 2, owner_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { id: 13, name: 'Sly', birth_date: '2012-06-08', type_id: 1, owner_id: 10, createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });

    // Insert visits
    await queryInterface.bulkInsert('visits', [
      { id: 1, pet_id: 7, visit_date: '2013-01-01', description: 'rabies shot', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, pet_id: 8, visit_date: '2013-01-02', description: 'rabies shot', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, pet_id: 8, visit_date: '2013-01-03', description: 'neutered', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, pet_id: 7, visit_date: '2013-01-04', description: 'spayed', createdAt: new Date(), updatedAt: new Date() }
    ], { ignoreDuplicates: true });
  },

  /**
   * @function down
   * @description Reverts the seeded data by deleting all records from the tables.
   * This should be done in reverse order of foreign key dependencies.
   * @param {object} queryInterface - The Sequelize QueryInterface object.
   * @param {object} Sequelize - The Sequelize module.
   * @returns {Promise<void>} A promise that resolves when all data is deleted.
   */
  down: async (queryInterface, Sequelize) => {
    // Delete data in reverse order of dependencies
    await queryInterface.bulkDelete('visits', null, {});
    await queryInterface.bulkDelete('pets', null, {});
    await queryInterface.bulkDelete('owners', null, {});
    await queryInterface.bulkDelete('types', null, {});
    await queryInterface.bulkDelete('vet_specialties', null, {});
    await queryInterface.bulkDelete('specialties', null, {});
    await queryInterface.bulkDelete('vets', null, {});
  }
};
