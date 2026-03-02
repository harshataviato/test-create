/**
 * Database Seeder
 * Populates initial data similar to data.sql in Spring
 */
const { sequelize, Vet, Specialty, PetType, Owner, Pet, Visit } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });
  const dentistry = await Specialty.create({ name: 'dentistry' });

  const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  await vet2.addSpecialty(radiology);

  const cat = await PetType.create({ name: 'cat' });
  const dog = await PetType.create({ name: 'dog' });

  const owner = await Owner.create({
    firstName: 'George',
    lastName: 'Franklin',
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023'
  });

  await Pet.create({
    name: 'Leo',
    birthDate: '2010-09-07',
    typeId: cat.id,
    ownerId: owner.id
  });

  console.log('Database Seeded!');
  process.exit();
}

seed();
