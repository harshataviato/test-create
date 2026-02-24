/**
 * Data seeding script.
 * Replicates functionality of data.sql to populate initial database state.
 */
const { sequelize, Vet, Specialty, PetType, Owner, Pet, Visit } = require('../models');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Reset DB

        // Specialties
        const radiology = await Specialty.create({ name: 'radiology' });
        const surgery = await Specialty.create({ name: 'surgery' });
        const dentistry = await Specialty.create({ name: 'dentistry' });

        // Vets
        await Vet.create({ firstName: 'James', lastName: 'Carter' });
        const helen = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
        await helen.addSpecialty(radiology);
        
        const linda = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
        await linda.addSpecialties([surgery, dentistry]);

        const rafael = await Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
        await rafael.addSpecialty(surgery);

        const henry = await Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
        await henry.addSpecialty(radiology);

        await Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

        // Types
        const cat = await PetType.create({ name: 'cat' });
        const dog = await PetType.create({ name: 'dog' });
        const lizard = await PetType.create({ name: 'lizard' });
        const snake = await PetType.create({ name: 'snake' });
        const bird = await PetType.create({ name: 'bird' });
        const hamster = await PetType.create({ name: 'hamster' });

        // Owners & Pets
        const george = await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
        await Pet.create({ name: 'Leo', birthDate: '2010-09-07', type_id: cat.id, owner_id: george.id });

        const betty = await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
        await Pet.create({ name: 'Basil', birthDate: '2012-08-06', type_id: hamster.id, owner_id: betty.id });

        const eduardo = await Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });
        await Pet.create({ name: 'Rosy', birthDate: '2011-04-17', type_id: dog.id, owner_id: eduardo.id });
        await Pet.create({ name: 'Jewel', birthDate: '2010-03-07', type_id: dog.id, owner_id: eduardo.id });

        const harold = await Owner.create({ firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' });
        await Pet.create({ name: 'Iggy', birthDate: '2010-11-30', type_id: lizard.id, owner_id: harold.id });

        const peter = await Owner.create({ firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' });
        await Pet.create({ name: 'George', birthDate: '2010-01-20', type_id: snake.id, owner_id: peter.id });

        const jean = await Owner.create({ firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' });
        const samantha = await Pet.create({ name: 'Samantha', birthDate: '2012-09-04', type_id: cat.id, owner_id: jean.id });
        const max = await Pet.create({ name: 'Max', birthDate: '2012-09-04', type_id: cat.id, owner_id: jean.id });

        // Visits
        await Visit.create({ pet_id: samantha.id, date: '2013-01-01', description: 'rabies shot' });
        await Visit.create({ pet_id: max.id, date: '2013-01-02', description: 'rabies shot' });
        await Visit.create({ pet_id: max.id, date: '2013-01-03', description: 'neutered' });
        await Visit.create({ pet_id: samantha.id, date: '2013-01-04', description: 'spayed' });

        console.log('Data seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed', err);
        process.exit(1);
    }
}

seed();
