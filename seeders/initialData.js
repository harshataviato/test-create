/**
 * Data seeder to populate the database with initial data
 * if it is empty. matches data.sql from original project.
 */
module.exports = async function(db) {
  // Vets
  const vetsData = [
    { firstName: 'James', lastName: 'Carter' },
    { firstName: 'Helen', lastName: 'Leary' },
    { firstName: 'Linda', lastName: 'Douglas' },
    { firstName: 'Rafael', lastName: 'Ortega' },
    { firstName: 'Henry', lastName: 'Stevens' },
    { firstName: 'Sharon', lastName: 'Jenkins' }
  ];
  const vets = await db.Vet.bulkCreate(vetsData);

  // Specialties
  const specsData = [
    { name: 'radiology' },
    { name: 'surgery' },
    { name: 'dentistry' }
  ];
  const specs = await db.Specialty.bulkCreate(specsData);

  // Vet Specialties (Indices are 0-based in array, but IDs usually 1-based)
  await vets[1].addSpecialty(specs[0]); // Helen - radiology
  await vets[2].addSpecialty(specs[1]); // Linda - surgery
  await vets[2].addSpecialty(specs[2]); // Linda - dentistry
  await vets[3].addSpecialty(specs[1]); // Rafael - surgery
  await vets[4].addSpecialty(specs[0]); // Henry - radiology

  // Pet Types
  const typesData = [
    { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }, 
    { name: 'snake' }, { name: 'bird' }, { name: 'hamster' }
  ];
  const types = await db.PetType.bulkCreate(typesData);

  // Owners
  const ownersData = [
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
  ];
  const owners = await db.Owner.bulkCreate(ownersData);

  // Pets
  // Note: owner_id and type_id need to be mapped to the created instances
  const petsData = [
    { name: 'Leo', birthDate: '2010-09-07', owner_id: owners[0].id, type_id: types[0].id },
    { name: 'Basil', birthDate: '2012-08-06', owner_id: owners[5].id, type_id: types[1].id },
    { name: 'Rosy', birthDate: '2011-04-17', owner_id: owners[1].id, type_id: types[1].id },
    { name: 'Jewel', birthDate: '2010-03-07', owner_id: owners[1].id, type_id: types[1].id },
    { name: 'Iggy', birthDate: '2010-11-30', owner_id: owners[2].id, type_id: types[2].id },
    { name: 'George', birthDate: '2010-01-20', owner_id: owners[3].id, type_id: types[3].id },
    { name: 'Samantha', birthDate: '2012-09-04', owner_id: owners[0].id, type_id: types[0].id },
    { name: 'Max', birthDate: '2012-09-04', owner_id: owners[0].id, type_id: types[0].id },
    { name: 'Lucky', birthDate: '2011-08-06', owner_id: owners[4].id, type_id: types[1].id },
    { name: 'Mulligan', birthDate: '2007-02-24', owner_id: owners[1].id, type_id: types[1].id },
    { name: 'Freddy', birthDate: '2010-03-09', owner_id: owners[4].id, type_id: types[4].id },
    { name: 'Lucky', birthDate: '2010-06-24', owner_id: owners[1].id, type_id: types[1].id },
    { name: 'Sly', birthDate: '2012-06-08', owner_id: owners[0].id, type_id: types[0].id }
  ];
  const pets = await db.Pet.bulkCreate(petsData);

  // Visits
  await db.Visit.bulkCreate([
    { pet_id: pets[6].id, date: '2013-01-01', description: 'rabies shot' },
    { pet_id: pets[7].id, date: '2013-01-02', description: 'rabies shot' },
    { pet_id: pets[7].id, date: '2013-01-03', description: 'neutered' },
    { pet_id: pets[6].id, date: '2013-01-04', description: 'spayed' }
  ]);

  console.log('Seeding complete.');
};
