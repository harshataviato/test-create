/**
 * Database Seeder.
 * 
 * Populates the database with initial data (Vets, Specialties) so the application
 * isn't empty upon first run.
 */

const { sequelize, Vet, Specialty, Owner } = require('../models');

async function seed() {
  await sequelize.sync({ force: true }); // Reset DB

  // Specialties
  const radiology = await Specialty.create({ name: 'radiology' });
  const surgery = await Specialty.create({ name: 'surgery' });
  const dentistry = await Specialty.create({ name: 'dentistry' });

  // Vets
  const vet1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = await Vet.create({ firstName: 'Helen', lastName: 'Leary' });
  const vet3 = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });

  await vet2.addSpecialty(radiology);
  await vet3.addSpecialty(surgery);
  await vet3.addSpecialty(dentistry);

  // Owners
  await Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
  
  console.log('Database seeded!');
  process.exit(0);
}

seed();
