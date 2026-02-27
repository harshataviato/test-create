const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Define Domain Models
 */

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  telephone: { type: DataTypes.STRING }
});

const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
});

const Visit = sequelize.define('Visit', {
  visitDate: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false }
});

const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
});

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
});

/**
 * Establish Relationships
 */

Owner.hasMany(Pet, { onDelete: 'CASCADE' });
Pet.belongsTo(Owner);

PetType.hasMany(Pet);
Pet.belongsTo(PetType);

Pet.hasMany(Visit, { onDelete: 'CASCADE' });
Visit.belongsTo(Pet);

// Many-to-Many for Vets and Specialties
Vet.belongsToMany(Specialty, { through: 'VetSpecialties' });
Specialty.belongsToMany(Vet, { through: 'VetSpecialties' });

/**
 * Data Seeding Logic
 * Ensures the database has initial data for development.
 */
async function seed() {
  await sequelize.sync({ force: false });
  
  const count = await Vet.count();
  if (count === 0) {
    const radiology = await Specialty.create({ name: 'radiology' });
    const surgery = await Specialty.create({ name: 'surgery' });
    
    const vet = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    await vet.addSpecialty(radiology);
    
    await PetType.bulkCreate([
      { name: 'cat' }, { name: 'dog' }, { name: 'lizard' }
    ]);
    
    console.log('Database seeded successfully.');
  }
}

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty, seed };
