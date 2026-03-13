const { Owner, Pet, PetType, Visit, Vet, Specialty } = require('../models');

/**
 * Database Seeder
 * Populates initial data mimicking data.sql from the original project.
 */
async function seedDatabase() {
  const count = await Owner.count();
  if (count > 0) return; // Prevent double seeding

  // Types
  const cat = await PetType.create({ name: 'cat' });
  const dog = await PetType.create({ name: 'dog' });
  const hamster = await PetType.create({ name: 'hamster' });

  // Specs
  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });

  // Vets
  const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  v2.addSpecialties([radiology]);

  // Owners
  const o1 = await Owner.create({
    firstName: 'George', lastName: 'Franklin', 
    address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
  });

  // Pets
  await Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: o1.id });
  
  console.log('Seed data inserted.');
}

module.exports = seedDatabase;
