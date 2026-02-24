/**
 * Data Seeding Script
 * 
 * Replicates the data.sql logic to populate the database with initial data.
 * Run this via `npm run seed`.
 */
const { sequelize, Vet, Specialty, PetType, Owner, Pet, Visit } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true }); // Reset database

    console.log('Database synced. Seeding data...');

    // Specialties
    const radiology = await Specialty.create({ name: 'radiology' });
    const surgery = await Specialty.create({ name: 'surgery' });
    const dentistry = await Specialty.create({ name: 'dentistry' });

    // Vets
    const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    await vet2.addSpecialty(radiology);
    const vet3 = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
    await vet3.addSpecialties([surgery, dentistry]);
    const vet4 = await Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
    await vet4.addSpecialty(surgery);
    const vet5 = await Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
    await vet5.addSpecialty(radiology);
    await Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

    // Pet Types
    const cat = await PetType.create({ name: 'cat' });
    const dog = await PetType.create({ name: 'dog' });
    const lizard = await PetType.create({ name: 'lizard' });
    const snake = await PetType.create({ name: 'snake' });
    const bird = await PetType.create({ name: 'bird' });
    const hamster = await PetType.create({ name: 'hamster' });

    // Owners & Pets
    const owner1 = await Owner.create({
      firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
    });
    const pet1 = await Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: owner1.id });

    const owner2 = await Owner.create({
      firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749'
    });
    const pet2 = await Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: hamster.id, ownerId: owner2.id });

    const owner6 = await Owner.create({
      firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654'
    });
    const pet7 = await Pet.create({ name: 'Samantha', birthDate: '2012-09-04', typeId: cat.id, ownerId: owner6.id });
    const pet8 = await Pet.create({ name: 'Max', birthDate: '2012-09-04', typeId: cat.id, ownerId: owner6.id });

    // Visits
    await Visit.create({ petId: pet7.id, visitDate: '2013-01-01', description: 'rabies shot' });
    await Visit.create({ petId: pet8.id, visitDate: '2013-01-02', description: 'rabies shot' });
    await Visit.create({ petId: pet8.id, visitDate: '2013-01-03', description: 'neutered' });
    await Visit.create({ petId: pet7.id, visitDate: '2013-01-04', description: 'spayed' });

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
