/**
 * Data Loader Utility.
 * 
 * Replaces resources/db/h2/data.sql.
 * Populates the database with initial data on startup.
 */
const { Owner, Pet, PetType, Vet, Specialty, Visit } = require('../models');

exports.loadData = async () => {
    try {
        const count = await Vet.count();
        if (count > 0) return; // Data already exists

        console.log('Loading initial data...');

        // Specialties
        const s1 = await Specialty.create({ name: 'radiology' });
        const s2 = await Specialty.create({ name: 'surgery' });
        const s3 = await Specialty.create({ name: 'dentistry' });

        // Vets
        await Vet.create({ firstName: 'James', lastName: 'Carter' });
        const v2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
        await v2.addSpecialty(s1);
        
        const v3 = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
        await v3.addSpecialties([s2, s3]);

        const v4 = await Vet.create({ firstName: 'Rafael', lastName: 'Ortega' });
        await v4.addSpecialty(s2);

        const v5 = await Vet.create({ firstName: 'Henry', lastName: 'Stevens' });
        await v5.addSpecialty(s1);

        await Vet.create({ firstName: 'Sharon', lastName: 'Jenkins' });

        // Pet Types
        const tCat = await PetType.create({ name: 'cat' });
        const tDog = await PetType.create({ name: 'dog' });
        const tLizard = await PetType.create({ name: 'lizard' });
        const tSnake = await PetType.create({ name: 'snake' });
        const tBird = await PetType.create({ name: 'bird' });
        const tHamster = await PetType.create({ name: 'hamster' });

        // Owners & Pets
        const o1 = await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
        const p1 = await Pet.create({ name: 'Leo', birthDate: '2010-09-07', typeId: tCat.id, ownerId: o1.id });

        const o2 = await Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
        await Pet.create({ name: 'Basil', birthDate: '2012-08-06', typeId: tHamster.id, ownerId: o2.id });

        const o3 = await Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });
        await Pet.create({ name: 'Rosy', birthDate: '2011-04-17', typeId: tDog.id, ownerId: o3.id });
        await Pet.create({ name: 'Jewel', birthDate: '2010-03-07', typeId: tDog.id, ownerId: o3.id });

        const o4 = await Owner.create({ firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' });
        await Pet.create({ name: 'Iggy', birthDate: '2010-11-30', typeId: tLizard.id, ownerId: o4.id });

        const o5 = await Owner.create({ firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' });
        await Pet.create({ name: 'George', birthDate: '2010-01-20', typeId: tSnake.id, ownerId: o5.id });

        const o6 = await Owner.create({ firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' });
        const pMax = await Pet.create({ name: 'Max', birthDate: '2012-09-04', typeId: tCat.id, ownerId: o6.id });
        const pSam = await Pet.create({ name: 'Samantha', birthDate: '2012-09-04', typeId: tCat.id, ownerId: o6.id });

        // Visits
        await Visit.create({ date: '2013-01-01', description: 'rabies shot', petId: pSam.id });
        await Visit.create({ date: '2013-01-02', description: 'rabies shot', petId: pMax.id });
        await Visit.create({ date: '2013-01-03', description: 'neutered', petId: pMax.id });
        await Visit.create({ date: '2013-01-04', description: 'spayed', petId: pSam.id });

        console.log('Initial data loaded successfully.');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
};
