/**
 * @fileoverview Sequelize seeder to populate the database with initial data.
 * This file contains data for veterinarians, specialties, pet types, owners, pets, and visits.
 * It mimics the `data.sql` files in the Java version.
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Defines the actions to be performed when applying this seeder.
   * Inserts sample data into `vets`, `specialties`, `vet_specialties`, `types`, `owners`, `pets`, and `visits` tables.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when all data is inserted.
   */
  async up(queryInterface, Sequelize) {
    // Insert initial data for 'vets'
    const vets = await queryInterface.bulkInsert('vets', [
      { first_name: 'James', last_name: 'Carter' },
      { first_name: 'Helen', last_name: 'Leary' },
      { first_name: 'Linda', last_name: 'Douglas' },
      { first_name: 'Rafael', last_name: 'Ortega' },
      { first_name: 'Henry', last_name: 'Stevens' },
      { first_name: 'Sharon', last_name: 'Jenkins' }
    ], { returning: true }); // 'returning: true' gets the inserted records, including IDs

    // Insert initial data for 'specialties'
    const specialties = await queryInterface.bulkInsert('specialties', [
      { name: 'radiology' },
      { name: 'surgery' },
      { name: 'dentistry' }
    ], { returning: true });

    // Map inserted records to an accessible format (e.g., { name: id })
    const vetMap = vets.reduce((acc, vet) => {
      acc[`${vet.first_name} ${vet.last_name}`] = vet.id;
      return acc;
    }, {});
    const specialtyMap = specialties.reduce((acc, specialty) => {
      acc[specialty.name] = specialty.id;
      return acc;
    }, {});

    // Insert data for 'vet_specialties' (join table)
    await queryInterface.bulkInsert('vet_specialties', [
      { vet_id: vetMap['Helen Leary'], specialty_id: specialtyMap['radiology'] },
      { vet_id: vetMap['Linda Douglas'], specialty_id: specialtyMap['surgery'] },
      { vet_id: vetMap['Linda Douglas'], specialty_id: specialtyMap['dentistry'] },
      { vet_id: vetMap['Rafael Ortega'], specialty_id: specialtyMap['surgery'] },
      { vet_id: vetMap['Henry Stevens'], specialty_id: specialtyMap['radiology'] }
    ]);

    // Insert initial data for 'types' (PetType)
    const types = await queryInterface.bulkInsert('types', [
      { name: 'cat' },
      { name: 'dog' },
      { name: 'lizard' },
      { name: 'snake' },
      { name: 'bird' },
      { name: 'hamster' }
    ], { returning: true });
    const typeMap = types.reduce((acc, type) => {
      acc[type.name] = type.id;
      return acc;
    }, {});

    // Insert initial data for 'owners'
    const owners = await queryInterface.bulkInsert('owners', [
      { first_name: 'George', last_name: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
      { first_name: 'Betty', last_name: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
      { first_name: 'Eduardo', last_name: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
      { first_name: 'Harold', last_name: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
      { first_name: 'Peter', last_name: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' },
      { first_name: 'Jean', last_name: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' },
      { first_name: 'Jeff', last_name: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387' },
      { first_name: 'Maria', last_name: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683' },
      { first_name: 'David', last_name: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' },
      { first_name: 'Carlos', last_name: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' }
    ], { returning: true });
    const ownerMap = owners.reduce((acc, owner) => {
      acc[`${owner.first_name} ${owner.last_name}`] = owner.id;
      return acc;
    }, {});

    // Insert initial data for 'pets'
    const pets = await queryInterface.bulkInsert('pets', [
      { name: 'Leo', birth_date: '2010-09-07', type_id: typeMap['cat'], owner_id: ownerMap['George Franklin'] },
      { name: 'Basil', birth_date: '2012-08-06', type_id: typeMap['hamster'], owner_id: ownerMap['Betty Davis'] },
      { name: 'Rosy', birth_date: '2011-04-17', type_id: typeMap['dog'], owner_id: ownerMap['Eduardo Rodriquez'] },
      { name: 'Jewel', birth_date: '2010-03-07', type_id: typeMap['dog'], owner_id: ownerMap['Eduardo Rodriquez'] },
      { name: 'Iggy', birth_date: '2010-11-30', type_id: typeMap['lizard'], owner_id: ownerMap['Harold Davis'] },
      { name: 'George', birth_date: '2010-01-20', type_id: typeMap['snake'], owner_id: ownerMap['Peter McTavish'] },
      { name: 'Samantha', birth_date: '2012-09-04', type_id: typeMap['cat'], owner_id: ownerMap['Jean Coleman'] },
      { name: 'Max', birth_date: '2012-09-04', type_id: typeMap['cat'], owner_id: ownerMap['Jean Coleman'] },
      { name: 'Lucky', birth_date: '2011-08-06', type_id: typeMap['bird'], owner_id: ownerMap['Jeff Black'] },
      { name: 'Mulligan', birth_date: '2007-02-24', type_id: typeMap['dog'], owner_id: ownerMap['Maria Escobito'] },
      { name: 'Freddy', birth_date: '2010-03-09', type_id: typeMap['bird'], owner_id: ownerMap['David Schroeder'] },
      { name: 'Lucky', birth_date: '2010-06-24', type_id: typeMap['dog'], owner_id: ownerMap['Carlos Estaban'] },
      { name: 'Sly', birth_date: '2012-06-08', type_id: typeMap['cat'], owner_id: ownerMap['Carlos Estaban'] }
    ], { returning: true });
    const petMap = pets.reduce((acc, pet) => {
      acc[`${pet.name}-${pet.owner_id}`] = pet.id; // Use name and ownerId for unique key
      return acc;
    }, {});

    // Insert initial data for 'visits'
    await queryInterface.bulkInsert('visits', [
      { pet_id: petMap['Samantha-6'], visit_date: '2013-01-01', description: 'rabies shot' },
      { pet_id: petMap['Max-6'], visit_date: '2013-01-02', description: 'rabies shot' },
      { pet_id: petMap['Max-6'], visit_date: '2013-01-03', description: 'neutered' },
      { pet_id: petMap['Samantha-6'], visit_date: '2013-01-04', description: 'spayed' }
    ]);
  },

  /**
   * Defines the actions to be performed when reverting this seeder.
   * Deletes all data from the tables in reverse order of foreign key dependencies.
   * @param {object} queryInterface - The Sequelize Query Interface.
   * @param {object} Sequelize - The Sequelize object.
   * @returns {Promise<void>} A promise that resolves when all data is deleted.
   */
  async down(queryInterface, Sequelize) {
    // Delete data from tables in reverse order of foreign key dependencies
    await queryInterface.bulkDelete('visits', null, {});
    await queryInterface.bulkDelete('pets', null, {});
    await queryInterface.bulkDelete('owners', null, {});
    await queryInterface.bulkDelete('vet_specialties', null, {});
    await queryInterface.bulkDelete('specialties', null, {});
    await queryInterface.bulkDelete('vets', null, {});
    await queryInterface.bulkDelete('types', null, {});
  }
};
