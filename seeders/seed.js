const { Owner, PetType, Vet, Specialty, sequelize } = require('../models');

/**
 * Senior Engineer Note: This mimics the data.sql functionality.
 * It's cleaner to handle this via JS for logic-heavy initialization.
 */
async function seed() {
  await sequelize.sync({ force: true });

  // Types
  const cat = await PetType.create({ name: 'cat' });
  const dog = await PetType.create({ name: 'dog' });
  await PetType.create({ name: 'hamster' });

  // Specialties
  const surgery = await Specialty.create({ name: 'surgery' });
  const dentistry = await Specialty.create({ name: 'dentistry' });

  // Vets
  const carter = await Vet.create({ firstName: 'James', lastName: 'Carter' });
  const douglas = await Vet.create({ firstName: 'Linda', lastName: 'Douglas' });
  await douglas.addSpecialties([surgery, dentistry]);

  // Sample Owner
  const george = await Owner.create({
    firstName: 'George',
    lastName: 'Franklin',
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023'
  });

  console.log('Database seeded successfully.');
  process.exit();
}

seed();
