const { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty } = require('./models');

/**
 * Seeds the database with initial data provided in the original Java version
 */
async function seed() {
    await sequelize.sync({ force: true });

    // Types
    const cat = await PetType.create({ name: 'cat' });
    const dog = await PetType.create({ name: 'dog' });
    const lizard = await PetType.create({ name: 'lizard' });

    // Owners
    const george = await Owner.create({
        firstName: 'George', lastName: 'Franklin', 
        address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
    });

    const betty = await Owner.create({
        firstName: 'Betty', lastName: 'Davis', 
        address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749'
    });

    // Pets
    const leo = await Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: cat.id, ownerId: george.id });
    const basil = await Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: lizard.id, ownerId: betty.id });

    // Visits
    await Visit.create({ date: '2013-01-01', description: 'rabies shot', petId: leo.id });

    // Vets
    const surgery = await Specialty.create({ name: 'surgery' });
    const radiology = await Specialty.create({ name: 'radiology' });
    
    const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    await v2.addSpecialty(radiology);

    console.log("Database seeded successfully.");
    process.exit();
}

seed();
