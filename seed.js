const { sequelize, Owner, PetType, Vet, Specialty, Pet, Visit } = require('./models');

/**
 * Seeds the database with initial data similar to data.sql
 */
async function seed() {
  await sequelize.sync({ force: true });

  const types = await PetType.bulkCreate([
    { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }
  ]);

  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });

  const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  await vet2.addSpecialty(radiology);

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
    type_id: types[0].id,
    owner_id: owner.id
  });

  await Visit.create({
    visitDate: '2013-01-01',
    description: 'rabies shot',
    pet_id: pet.id
  });

  console.log('Database seeded!');
  process.exit();
}

seed();
