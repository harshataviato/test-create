/**
 * Database Helper for Tests
 * Handles cleaning and seeding the database between tests.
 */
const { sequelize, PetType, Vet, Specialty } = require('../../models');

const resetDb = async () => {
    // Force sync drops tables and recreates them
    await sequelize.sync({ force: true });
};

const seedBasicData = async () => {
    // We need at least PetTypes to create Pets
    await PetType.bulkCreate([
        { name: 'cat' },
        { name: 'dog' },
        { name: 'lizard' }
    ]);
    
    // Seed some specialties for Vet tests
    const specialties = await Specialty.bulkCreate([
        { name: 'radiology' },
        { name: 'surgery' }
    ]);
    
    const vet = await Vet.create({ firstName: 'Test', lastName: 'Vet' });
    await vet.addSpecialty(specialties[0]);
};

module.exports = {
    sequelize,
    resetDb,
    seedBasicData
};
