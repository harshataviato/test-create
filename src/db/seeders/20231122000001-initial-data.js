/**
 * @file db/seeders/20231122000001-initial-data.js
 * @description Sequelize seeder for populating initial data into the database
 * for the Node.js PetClinic application.
 * This seeder closely mirrors the `data.sql` files from the Java version.
 */

'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  /**
   * @method up
   * @description Inserts initial data into the tables.
   * Uses `bulkInsert` for efficiency.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize query interface.
   * @param {import('sequelize')} Sequelize - Sequelize library.
   */
  async up(queryInterface, Sequelize) {
    // Vets
    await queryInterface.bulkInsert('vets', [
      { id: 1, first_name: 'James', last_name: 'Carter' },
      { id: 2, first_name: 'Helen', last_name: 'Leary' },
      { id: 3, first_name: 'Linda', last_name: 'Douglas' },
      { id: 4, first_name: 'Rafael', last_name: 'Ortega' },
      { id: 5, first_name: 'Henry', last_name: 'Stevens' },
      { id: 6, first_name: 'Sharon', last_name: 'Jenkins' },
    ], { ignoreDuplicates: true }); // ignoreDuplicates to prevent errors on re-seeding

    // Specialties
    await queryInterface.bulkInsert('specialties', [
      { id: 1, name: 'radiology' },
      { id: 2, name: 'surgery' },
      { id: 3, name: 'dentistry' },
    ], { ignoreDuplicates: true });

    // Vet_specialties (junction table)
    await queryInterface.bulkInsert('vet_specialties', [
      { vet_id: 2, specialty_id: 1 },
      { vet_id: 3, specialty_id: 2 },
      { vet_id: 3, specialty_id: 3 },
      { vet_id: 4, specialty_id: 2 },
      { vet_id: 5, specialty_id: 1 },
    ], { ignoreDuplicates: true });

    // Types
    await queryInterface.bulkInsert('types', [
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' },
      { id: 3, name: 'lizard' },
      { id: 4, name: 'snake' },
      { id: 5, name: 'bird' },
      { id: 6, name: 'hamster' },
    ], { ignoreDuplicates: true });

    // Owners
    await queryInterface.bulkInsert('owners', [
      { id: 1, first_name: 'George', last_name: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
      { id: 2, first_name: 'Betty', last_name: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
      { id: 3, first_name: 'Eduardo', last_name: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
      { id: 4, first_name: 'Harold', last_name: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
      { id: 5, first_name: 'Peter', last_name: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' },
      { id: 6, first_name: 'Jean', last_name: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' },
      { id: 7, first_name: 'Jeff', last_name: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387' },
      { id: 8, first_name: 'Maria', last_name: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683' },
      { id: 9, first_name: 'David', last_name: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' },
      { id: 10, first_name: 'Carlos', last_name: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' },
    ], { ignoreDuplicates: true });

    // Pets
    await queryInterface.bulkInsert('pets', [
      { id: 1, name: 'Leo', birth_date: '2000-09-07', type_id: 1, owner_id: 1 },
      { id: 2, name: 'Basil', birth_date: '2002-08-06', type_id: 6, owner_id: 2 },
      { id: 3, name: 'Rosy', birth_date: '2001-04-17', type_id: 2, owner_id: 3 },
      { id: 4, name: 'Jewel', birth_date: '2000-03-07', type_id: 2, owner_id: 3 },
      { id: 5, name: 'Iggy', birth_date: '2000-11-30', type_id: 3, owner_id: 4 },
      { id: 6, name: 'George', birth_date: '2000-01-20', type_id: 4, owner_id: 5 },
      { id: 7, name: 'Samantha', birth_date: '1995-09-04', type_id: 1, owner_id: 6 },
      { id: 8, name: 'Max', birth_date: '1995-09-04', type_id: 1, owner_id: 6 },
      { id: 9, name: 'Lucky', birth_date: '1999-08-06', type_id: 5, owner_id: 7 },
      { id: 10, name: 'Mulligan', birth_date: '1997-02-24', type_id: 2, owner_id: 8 },
      { id: 11, name: 'Freddy', birth_date: '2000-03-09', type_id: 5, owner_id: 9 },
      { id: 12, name: 'Lucky', birth_date: '2000-06-24', type_id: 2, owner_id: 10 },
      { id: 13, name: 'Sly', birth_date: '2002-06-08', type_id: 1, owner_id: 10 },
    ], { ignoreDuplicates: true });

    // Visits
    await queryInterface.bulkInsert('visits', [
      { id: 1, pet_id: 7, visit_date: '2010-03-04', description: 'rabies shot' },
      { id: 2, pet_id: 8, visit_date: '2011-03-04', description: 'rabies shot' },
      { id: 3, pet_id: 8, visit_date: '2009-06-04', description: 'neutered' },
      { id: 4, pet_id: 7, visit_date: '2008-09-04', description: 'spayed' },
    ], { ignoreDuplicates: true });
  },

  /**
   * @method down
   * @description Removes all data inserted by the seeder.
   * Deletes in reverse order to respect foreign key constraints.
   * @param {import('sequelize').QueryInterface} queryInterface - Sequelize query interface.
   * @param {import('sequelize')} Sequelize - Sequelize library.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('visits', null, {});
    await queryInterface.bulkDelete('pets', null, {});
    await queryInterface.bulkDelete('owners', null, {});
    await queryInterface.bulkDelete('types', null, {});
    await queryInterface.bulkDelete('vet_specialties', null, {});
    await queryInterface.bulkDelete('specialties', null, {});
    await queryInterface.bulkDelete('vets', null, {});
  }
};
