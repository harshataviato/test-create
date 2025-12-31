/**
 * @module config/seedData
 * @description Contains functions to seed initial data into the database.
 * This is useful for development and testing environments.
 */

const db = require('./database');
const moment = require('moment');

/**
 * @function seed
 * @description Seeds the database with initial PetTypes, Vets, Specialties, Owners, Pets, and Visits.
 * @async
 * @returns {Promise<void>} A promise that resolves when all data is seeded.
 */
async function seed() {
  console.log('Seeding initial data...');
  try {
    // Clear existing data (optional, for development purposes)
    // await db.Visit.destroy({ truncate: true, cascade: true });
    // await db.Pet.destroy({ truncate: true, cascade: true });
    // await db.Owner.destroy({ truncate: true, cascade: true });
    // await db.VetSpecialty.destroy({ truncate: true, cascade: true });
    // await db.Vet.destroy({ truncate: true, cascade: true });
    // await db.Specialty.destroy({ truncate: true, cascade: true });
    // await db.PetType.destroy({ truncate: true, cascade: true });

    // Pet Types
    const catType = await db.PetType.findOrCreate({ where: { name: 'Cat' } });
    const dogType = await db.PetType.findOrCreate({ where: { name: 'Dog' } });
    const lizardType = await db.PetType.findOrCreate({ where: { name: 'Lizard' } });
    const snakeType = await db.PetType.findOrCreate({ where: { name: 'Snake' } });
    const birdType = await db.PetType.findOrCreate({ where: { name: 'Bird' } });
    const hamsterType = await db.PetType.findOrCreate({ where: { name: 'Hamster' } });

    // Specialties
    const radiology = await db.Specialty.findOrCreate({ where: { name: 'radiology' } });
    const surgery = await db.Specialty.findOrCreate({ where: { name: 'surgery' } });
    const dentistry = await db.Specialty.findOrCreate({ where: { name: 'dentistry' } });

    // Vets
    const vet1 = await db.Vet.findOrCreate({
      where: { firstName: 'James', lastName: 'Carter' },
      defaults: { firstName: 'James', lastName: 'Carter' }
    });
    const vet2 = await db.Vet.findOrCreate({
      where: { firstName: 'Helen', lastName: 'Leary' },
      defaults: { firstName: 'Helen', lastName: 'Leary' }
    });
    const vet3 = await db.Vet.findOrCreate({
      where: { firstName: 'Linda', lastName: 'Douglas' },
      defaults: { firstName: 'Linda', lastName: 'Douglas' }
    });
    const vet4 = await db.Vet.findOrCreate({
      where: { firstName: 'Rafael', lastName: 'Ortega' },
      defaults: { firstName: 'Rafael', lastName: 'Ortega' }
    });
    const vet5 = await db.Vet.findOrCreate({
      where: { firstName: 'Henry', lastName: 'Bernard' },
      defaults: { firstName: 'Henry', lastName: 'Bernard' }
    });
    const vet6 = await db.Vet.findOrCreate({
      where: { firstName: 'Sharon', lastName: 'Jenkins' },
      defaults: { firstName: 'Sharon', lastName: 'Jenkins' }
    });

    // Assign specialties to vets
    await vet2[0].addSpecialty(radiology[0]); // Helen Leary - radiology
    await vet3[0].addSpecialty(dentistry[0]); // Linda Douglas - dentistry
    await vet4[0].addSpecialty(surgery[0]);   // Rafael Ortega - surgery

    // Owners
    const owner1 = await db.Owner.findOrCreate({
      where: { lastName: 'Franklin' },
      defaults: {
        firstName: 'George',
        lastName: 'Franklin',
        address: '110 W. Liberty St.',
        city: 'Madison',
        telephone: '6085551023'
      }
    });
    const owner2 = await db.Owner.findOrCreate({
      where: { lastName: 'Davis' },
      defaults: {
        firstName: 'Betty',
        lastName: 'Davis',
        address: '638 Cardinal Ave.',
        city: 'Sun Prairie',
        telephone: '6085551749'
      }
    });

    // Pets
    const pet1 = await db.Pet.findOrCreate({
      where: { name: 'Leo', ownerId: owner1[0].id },
      defaults: {
        name: 'Leo',
        birthDate: moment('2000-09-07').toDate(),
        typeId: catType[0].id,
        ownerId: owner1[0].id
      }
    });
    const pet2 = await db.Pet.findOrCreate({
      where: { name: 'Basil', ownerId: owner2[0].id },
      defaults: {
        name: 'Basil',
        birthDate: moment('2002-08-06').toDate(),
        typeId: hamsterType[0].id,
        ownerId: owner2[0].id
      }
    });

    // Visits
    await db.Visit.findOrCreate({
      where: { petId: pet1[0].id, visitDate: moment('2010-01-01').toDate() },
      defaults: {
        petId: pet1[0].id,
        visitDate: moment('2010-01-01').toDate(),
        description: 'neutered'
      }
    });
    await db.Visit.findOrCreate({
      where: { petId: pet2[0].id, visitDate: moment('2010-01-01').toDate() },
      defaults: {
        petId: pet2[0].id,
        visitDate: moment('2010-01-01').toDate(),
        description: 'rabies shot'
      }
    });

    console.log('Data seeding complete!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

module.exports = { seed };
