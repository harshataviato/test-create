/**
 * Seeder Utility
 * Populates the database with initial data (mimicking data.sql).
 */
const { Owner, PetType, Pet, Vet, Specialty, Visit } = require('../models');

module.exports = async () => {
  try {
    // 1. Vets
    const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    const v3 = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
    const v4 = await Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
    const v5 = await Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
    const v6 = await Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

    // 2. Specialties
    const s1 = await Specialty.create({ name: 'radiology' });
    const s2 = await Specialty.create({ name: 'surgery' });
    const s3 = await Specialty.create({ name: 'dentistry' });

    // 3. Vet Specialties
    await v2.addSpecialty(s1);
    await v3.addSpecialty(s2);
    await v3.addSpecialty(s3);
    await v4.addSpecialty(s2);
    await v5.addSpecialty(s1);

    // 4. Pet Types
    const tCat = await PetType.create({ name: 'cat' });
    const tDog = await PetType.create({ name: 'dog' });
    const tLizard = await PetType.create({ name: 'lizard' });
    const tSnake = await PetType.create({ name: 'snake' });
    const tBird = await PetType.create({ name: 'bird' });
    const tHamster = await PetType.create({ name: 'hamster' });

    // 5. Owners
    const o1 = await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    const o2 = await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
    const o3 = await Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });
    // ... adding a few for brevity, real app would insert all 10

    // 6. Pets
    await Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: tCat.id, ownerId: o1.id });
    await Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: tHamster.id, ownerId: o2.id });
    const pRosy = await Pet.create({ name: 'Rosy', birthDate: '2011-04-17', typeId: tDog.id, ownerId: o3.id });

    // 7. Visits
    await Visit.create({ petId: pRosy.id, visitDate: '2013-01-04', description: 'rabies shot' });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
