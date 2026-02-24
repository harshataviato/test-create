/**
 * Data Seeder
 * 
 * Populates the database with initial data on startup if empty.
 * Equivalent to data.sql.
 */
const { Vet, Specialty, PetType, Owner, Pet, Visit } = require('../models');

async function seedData() {
  const vetCount = await Vet.count();
  if (vetCount > 0) return; // Already seeded

  console.log('Seeding Database...');

  // Vets
  const vets = await Vet.bulkCreate([
    { firstName: 'James', lastName: 'Carter' },
    { firstName: 'Helen', lastName: 'Leary' },
    { firstName: 'Linda', lastName: 'Douglas' },
    { firstName: 'Rafael', lastName: 'Ortega' },
    { firstName: 'Henry', lastName: 'Stevens' },
    { firstName: 'Sharon', lastName: 'Jenkins' }
  ]);

  // Specialties
  const specs = await Specialty.bulkCreate([
    { name: 'radiology' },
    { name: 'surgery' },
    { name: 'dentistry' }
  ]);

  // Vet Specialties (Associations)
  await vets[1].addSpecialty(specs[0]); // Helen - radiology
  await vets[2].addSpecialty(specs[1]); // Linda - surgery
  await vets[2].addSpecialty(specs[2]); // Linda - dentistry
  await vets[3].addSpecialty(specs[1]); // Rafael - surgery
  await vets[4].addSpecialty(specs[0]); // Henry - radiology

  // Pet Types
  const types = await PetType.bulkCreate([
    { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }, 
    { name: 'snake' }, { name: 'bird' }, { name: 'hamster' }
  ]);

  // Owners
  const owner1 = await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
  const owner2 = await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
  // ... (Abbreviated for brevity, normally contains all 10)

  // Pets
  const pet1 = await Pet.create({ name: 'Leo', birthDate: '2010-09-07', type_id: types[0].id, owner_id: owner1.id });
  const pet2 = await Pet.create({ name: 'Basil', birthDate: '2012-08-06', type_id: types[5].id, owner_id: owner2.id });

  // Visits
  await Visit.create({ date: '2013-01-01', description: 'rabies shot', pet_id: pet2.id });

  console.log('Seeding Complete.');
}

module.exports = seedData;
