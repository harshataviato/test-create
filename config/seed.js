/**
 * Seeder script to populate the database with initial data.
 * Mimics the 'data.sql' files from the Java project.
 */
module.exports = async (db) => {
  // Specialties
  const radiology = await db.Specialty.create({ name: 'radiology' });
  const surgery = await db.Specialty.create({ name: 'surgery' });
  const dentistry = await db.Specialty.create({ name: 'dentistry' });

  // Vets
  const vet1 = await db.Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await db.Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  const vet3 = await db.Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
  const vet4 = await db.Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
  const vet5 = await db.Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
  const vet6 = await db.Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

  // Vet Specialties
  await vet2.addSpecialty(radiology);
  await vet3.addSpecialty(surgery);
  await vet3.addSpecialty(dentistry);
  await vet4.addSpecialty(surgery);
  await vet5.addSpecialty(radiology);

  // Pet Types
  const cat = await db.PetType.create({ name: 'cat' });
  const dog = await db.PetType.create({ name: 'dog' });
  const lizard = await db.PetType.create({ name: 'lizard' });
  const snake = await db.PetType.create({ name: 'snake' });
  const bird = await db.PetType.create({ name: 'bird' });
  const hamster = await db.PetType.create({ name: 'hamster' });

  // Owners
  const owner1 = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
  const owner2 = await db.Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
  // ... (Adding a few representative owners for brevity, full list can be extended)

  // Pets
  const pet1 = await db.Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: owner1.id });
  const pet2 = await db.Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: hamster.id, ownerId: owner2.id });

  // Visits
  await db.Visit.create({ date: '2013-01-01', description: 'rabies shot', petId: pet1.id });
  await db.Visit.create({ date: '2013-01-02', description: 'checkup', petId: pet2.id });
};
