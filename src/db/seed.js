/**
 * Seeding Script
 * Populates the SQLite database with identical data to the Spring PetClinic
 */
const { sequelize, Owner, Pet, PetType, Vet, Specialty, Visit } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const cat = await PetType.create({ name: 'cat' });
  const dog = await PetType.create({ name: 'dog' });
  const hamster = await PetType.create({ name: 'hamster' });

  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });

  const owner = await Owner.create({
    firstName: 'George',
    lastName: 'Franklin',
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023'
  });

  const pet = await Pet.create({
    name: 'Leo',
    birthDate: '2010-09-07',
    type_id: cat.id,
    owner_id: owner.id
  });

  await Visit.create({
    date: '2013-01-01',
    description: 'rabies shot',
    pet_id: pet.id
  });

  const vet = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  await vet.addSpecialty(radiology);

  console.log('Database seeded successfully!');
  process.exit();
}

seed();
