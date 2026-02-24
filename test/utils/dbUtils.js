const db = require('../../models');

/**
 * Clean up the database by truncating all tables.
 * Used in setup/teardown to ensure test isolation.
 */
const cleanDb = async () => {
  if (process.env.NODE_ENV === 'test') {
    await db.Visit.destroy({ where: {}, truncate: false }); // SQLite doesn't support truncate with foreign keys easily
    await db.Pet.destroy({ where: {}, truncate: false });
    await db.Owner.destroy({ where: {}, truncate: false });
    // We keep Vets, Specialties, and PetTypes as they are usually static reference data
    // If specific tests need them clean, they can handle it.
  }
};

/**
 * Seeds reference data (PetTypes, Specialties) required for creating valid entities.
 */
const seedReferenceData = async () => {
  const typesCount = await db.PetType.count();
  if (typesCount === 0) {
    await db.PetType.bulkCreate([
      { name: 'cat' }, { name: 'dog' }, { name: 'bird' }
    ]);
  }
};

module.exports = {
  cleanDb,
  seedReferenceData,
  db
};
