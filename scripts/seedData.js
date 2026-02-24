/**
 * Data Seeding Script
 * Populates the database with initial data similar to data.sql
 */
module.exports = async (db) => {
  // Specialties
  const radiology = await db.Specialty.create({ name: 'radiology' });
  const surgery = await db.Specialty.create({ name: 'surgery' });
  const dentistry = await db.Specialty.create({ name: 'dentistry' });

  // Vets
  const james = await db.Vet.create({ firstName: 'James', lastName: 'Carter' });
  const helen = await db.Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  const linda = await db.Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
  const rafael = await db.Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
  
  await helen.addSpecialty(radiology);
  await linda.addSpecialty(surgery);
  await linda.addSpecialty(dentistry);
  await rafael.addSpecialty(surgery);

  // Pet Types
  const types = await db.PetType.bulkCreate([
    { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }, 
    { name: 'snake' }, { name: 'bird' }, { name: 'hamster' }
  ]);

  // Owners
  const george = await db.Owner.create({
    firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
  });
  const betty = await db.Owner.create({
    firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749'
  });

  // Pets
  const leo = await db.Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: 1, ownerId: george.id });
  const basil = await db.Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: 6, ownerId: betty.id });

  // Visits
  await db.Visit.create({ date: '2013-01-01', description: 'rabies shot', petId: leo.id });
};
