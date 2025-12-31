/**
 * @module test/setup
 * @description Global setup file for Mocha tests.
 * Configures the test environment, database, and global utilities before running tests.
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.SQLITE_STORAGE = ':memory:'; // Use in-memory SQLite for fast, isolated tests
process.env.DEFAULT_LOCALE = 'en'; // Ensure consistent locale for tests
process.env.CACHE_TTL_SECONDS = '1'; // Short TTL for cache tests

const chai = require('chai');
const sinon = require('sinon');
const supertest = require('supertest');
const db = require('../config/database'); // Import database configuration
const app = require('../app'); // Import the Express app

// Expose chai's expect globally for convenience
global.expect = chai.expect;
global.request = supertest(app); // Global supertest instance for the app

// Seed data for tests
const moment = require('moment');

const seedTestData = async () => {
  console.log('Seeding initial data for tests...');
  try {
    // Pet Types
    const catType = await db.PetType.findOrCreate({ where: { name: 'Cat' }, defaults: { name: 'Cat' } });
    const dogType = await db.PetType.findOrCreate({ where: { name: 'Dog' }, defaults: { name: 'Dog' } });
    const lizardType = await db.PetType.findOrCreate({ where: { name: 'Lizard' }, defaults: { name: 'Lizard' } });

    // Specialties
    const radiology = await db.Specialty.findOrCreate({ where: { name: 'radiology' }, defaults: { name: 'radiology' } });
    const surgery = await db.Specialty.findOrCreate({ where: { name: 'surgery' }, defaults: { name: 'surgery' } });
    const dentistry = await db.Specialty.findOrCreate({ where: { name: 'dentistry' }, defaults: { name: 'dentistry' } });

    // Vets
    const vet1 = await db.Vet.findOrCreate({ where: { firstName: 'James', lastName: 'Carter' }, defaults: { firstName: 'James', lastName: 'Carter' } });
    const vet2 = await db.Vet.findOrCreate({ where: { firstName: 'Helen', lastName: 'Leary' }, defaults: { firstName: 'Helen', lastName: 'Leary' } });
    const vet3 = await db.Vet.findOrCreate({ where: { firstName: 'Linda', lastName: 'Douglas' }, defaults: { firstName: 'Linda', lastName: 'Douglas' } });

    await vet2[0].addSpecialty(radiology[0]);
    await vet3[0].addSpecialty(dentistry[0]);

    // Owners
    const owner1 = await db.Owner.findOrCreate({
      where: { lastName: 'Franklin' },
      defaults: { firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' }
    });
    const owner2 = await db.Owner.findOrCreate({
      where: { lastName: 'Davis' },
      defaults: { firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' }
    });
    const owner3 = await db.Owner.findOrCreate({
      where: { lastName: 'Black' },
      defaults: { firstName: 'John', lastName: 'Black', address: '123 Test St.', city: 'Testville', telephone: '1234567890' }
    });
    const owner4 = await db.Owner.findOrCreate({
      where: { lastName: 'Smith' },
      defaults: { firstName: 'Jane', lastName: 'Smith', address: '456 Test Ave.', city: 'Testville', telephone: '0987654321' }
    });


    // Pets
    const pet1 = await db.Pet.findOrCreate({
      where: { name: 'Leo', ownerId: owner1[0].id },
      defaults: { name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: catType[0].id, ownerId: owner1[0].id }
    });
    const pet2 = await db.Pet.findOrCreate({
      where: { name: 'Basil', ownerId: owner2[0].id },
      defaults: { name: 'Basil', birthDate: moment('2002-08-06').toDate(), typeId: dogType[0].id, ownerId: owner2[0].id }
    });
    const pet3 = await db.Pet.findOrCreate({
      where: { name: 'Max', ownerId: owner1[0].id },
      defaults: { name: 'Max', birthDate: moment('2018-01-15').toDate(), typeId: dogType[0].id, ownerId: owner1[0].id }
    });

    // Visits
    await db.Visit.findOrCreate({
      where: { petId: pet1[0].id, visitDate: moment('2010-01-01').toDate() },
      defaults: { petId: pet1[0].id, visitDate: moment('2010-01-01').toDate(), description: 'neutered' }
    });
    await db.Visit.findOrCreate({
      where: { petId: pet2[0].id, visitDate: moment('2010-01-01').toDate() },
      defaults: { petId: pet2[0].id, visitDate: moment('2010-01-01').toDate(), description: 'rabies shot' }
    });
    await db.Visit.findOrCreate({
      where: { petId: pet1[0].id, visitDate: moment('2012-05-10').toDate() },
      defaults: { petId: pet1[0].id, visitDate: moment('2012-05-10').toDate(), description: 'annual checkup' }
    });

    console.log('Test data seeding complete!');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
};


before(async () => {
  // Connect and sync database, forcing table recreation for a clean state
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await db.sequelize.sync({ force: true }); // DANGER: This drops all tables! Only for test env.
    console.log('All models were synchronized successfully (force: true).');
    await seedTestData();
  } catch (error) {
    console.error('Unable to connect to the test database or synchronize models:', error);
    process.exit(1);
  }
});

after(async () => {
  // Close database connection after all tests are done
  try {
    await db.sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

