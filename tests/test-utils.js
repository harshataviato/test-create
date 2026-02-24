/**
 * Test Utilities
 * Handles database connection lifecycle and seeding for tests.
 */
const { sequelize, PetType, Vet, Specialty } = require('../src/models');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.SQLITE_PATH || './test_db.sqlite';

const setupTestDB = async () => {
  // Ensure we are using a clean sync
  await sequelize.sync({ force: true });
};

const seedBasicData = async () => {
  // Seed PetTypes needed for Pet tests
  await PetType.bulkCreate([
    { name: 'dog' },
    { name: 'cat' },
    { name: 'bird' }
  ]);
};

const seedVetData = async () => {
  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });
  const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  await vet2.addSpecialty(radiology);
};

const closeTestDB = async () => {
  await sequelize.close();
  // Cleanup file
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH);
    } catch (e) {
      // ignore
    }
  }
};

module.exports = {
  setupTestDB,
  closeTestDB,
  seedBasicData,
  seedVetData,
  sequelize
};
