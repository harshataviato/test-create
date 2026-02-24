/**
 * Seeding Script
 * Populates the database with initial data similar to data.sql
 */
const db = require('../models');

async function seed() {
  try {
    await db.sequelize.sync({ force: true }); // Reset DB

    // 1. Vets & Specialties
    const radiology = await db.Specialty.create({ name: 'radiology' });
    const surgery = await db.Specialty.create({ name: 'surgery' });
    const dentistry = await db.Specialty.create({ name: 'dentistry' });

    const vet1 = await db.Vet.create({ firstName: 'James', lastName: 'Carter' });
    const vet2 = await db.Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    await vet2.addSpecialty(radiology);
    
    const vet3 = await db.Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
    await vet3.addSpecialty(surgery);
    await vet3.addSpecialty(dentistry);

    const vet4 = await db.Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
    await vet4.addSpecialty(surgery);

    const vet5 = await db.Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
    await vet5.addSpecialty(radiology);

    const vet6 = await db.Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

    // 2. Pet Types
    const cat = await db.PetType.create({ name: 'cat' });
    const dog = await db.PetType.create({ name: 'dog' });
    const lizard = await db.PetType.create({ name: 'lizard' });
    const snake = await db.PetType.create({ name: 'snake' });
    const bird = await db.PetType.create({ name: 'bird' });
    const hamster = await db.PetType.create({ name: 'hamster' });

    // 3. Owners & Pets
    const owner1 = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    const pet1 = await db.Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: owner1.id });

    const owner2 = await db.Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
    await db.Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: hamster.id, ownerId: owner2.id });

    const owner3 = await db.Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });
    await db.Pet.create({ name: 'Rosy', birthDate: '2011-04-17', typeId: dog.id, ownerId: owner3.id });
    await db.Pet.create({ name: 'Jewel', birthDate: '2010-03-07', typeId: dog.id, ownerId: owner3.id });

    const owner6 = await db.Owner.create({ firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' });
    const pet7 = await db.Pet.create({ name: 'Samantha', birthDate: '2012-09-04', typeId: cat.id, ownerId: owner6.id });
    const pet8 = await db.Pet.create({ name: 'Max', birthDate: '2012-09-04', typeId: cat.id, ownerId: owner6.id });

    // 4. Visits
    await db.Visit.create({ date: '2013-01-01', description: 'rabies shot', petId: pet7.id });
    await db.Visit.create({ date: '2013-01-02', description: 'rabies shot', petId: pet8.id });
    await db.Visit.create({ date: '2013-01-03', description: 'neutered', petId: pet8.id });
    await db.Visit.create({ date: '2013-01-04', description: 'spayed', petId: pet7.id });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
