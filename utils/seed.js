/**
 * Database Seeder
 * Populates the database with initial data similar to data.sql
 */
const { sequelize, Vet, Specialty, PetType, Owner, Pet, Visit } = require('../models');

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset DB

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
        const specialties = await Specialty.bulkCreate([
            { name: 'radiology' },
            { name: 'surgery' },
            { name: 'dentistry' }
        ]);

        // Vet Specialties
        await vets[1].addSpecialty(specialties[0]); // Helen - radiology
        await vets[2].addSpecialty(specialties[1]); // Linda - surgery
        await vets[2].addSpecialty(specialties[2]); // Linda - dentistry
        await vets[3].addSpecialty(specialties[1]); // Rafael - surgery
        await vets[4].addSpecialty(specialties[0]); // Henry - radiology

        // Types
        const types = await PetType.bulkCreate([
            { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }, 
            { name: 'snake' }, { name: 'bird' }, { name: 'hamster' }
        ]);

        // Owners
        const owners = await Owner.bulkCreate([
            { firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
            { firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
            { firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
            { firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
            { firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' },
            { firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' },
            { firstName: 'Jeff', lastName: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387' },
            { firstName: 'Maria', lastName: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683' },
            { firstName: 'David', lastName: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' },
            { firstName: 'Carlos', lastName: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' }
        ]);

        // Pets
        const pets = await Pet.bulkCreate([
            { name: 'Leo', birthDate: '2010-09-07', type_id: types[0].id, owner_id: owners[0].id },
            { name: 'Basil', birthDate: '2012-08-06', type_id: types[5].id, owner_id: owners[1].id },
            { name: 'Rosy', birthDate: '2011-04-17', type_id: types[1].id, owner_id: owners[2].id },
            { name: 'Jewel', birthDate: '2010-03-07', type_id: types[1].id, owner_id: owners[2].id },
            { name: 'Iggy', birthDate: '2010-11-30', type_id: types[2].id, owner_id: owners[3].id },
            { name: 'George', birthDate: '2010-01-20', type_id: types[3].id, owner_id: owners[4].id },
            { name: 'Samantha', birthDate: '2012-09-04', type_id: types[0].id, owner_id: owners[5].id },
            { name: 'Max', birthDate: '2012-09-04', type_id: types[0].id, owner_id: owners[5].id },
            { name: 'Lucky', birthDate: '2011-08-06', type_id: types[4].id, owner_id: owners[6].id },
            { name: 'Mulligan', birthDate: '2007-02-24', type_id: types[1].id, owner_id: owners[7].id },
            { name: 'Freddy', birthDate: '2010-03-09', type_id: types[4].id, owner_id: owners[8].id },
            { name: 'Lucky', birthDate: '2010-06-24', type_id: types[1].id, owner_id: owners[9].id },
            { name: 'Sly', birthDate: '2012-06-08', type_id: types[0].id, owner_id: owners[9].id }
        ]);

        // Visits
        await Visit.bulkCreate([
            { pet_id: pets[6].id, date: '2013-01-01', description: 'rabies shot' },
            { pet_id: pets[7].id, date: '2013-01-02', description: 'rabies shot' },
            { pet_id: pets[7].id, date: '2013-01-03', description: 'neutered' },
            { pet_id: pets[6].id, date: '2013-01-04', description: 'spayed' }
        ]);

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
    }
};

// If run directly
if (require.main === module) {
    seed().then(() => process.exit());
}

module.exports = seed;
