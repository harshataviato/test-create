const { Sequelize, DataTypes } = require('sequelize');

/**
 * Database abstraction layer.
 * Senior Engineer Note: Using SQLite for portability and easy local execution.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false
});

// Define Base Models
const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'types' });

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'specialties' });

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' },
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  telephone: DataTypes.STRING
}, { tableName: 'owners' });

const Pet = sequelize.define('Pet', {
  name: DataTypes.STRING,
  birthDate: { type: DataTypes.DATEONLY, field: 'birth_date' }
}, { tableName: 'pets' });

const Visit = sequelize.define('Visit', {
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: DataTypes.STRING
}, { tableName: 'visits' });

const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' }
}, { tableName: 'vets' });

// Associations
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

Vet.belongsToMany(Specialty, { through: 'vet_specialties', as: 'specialties', foreignKey: 'vet_id' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', foreignKey: 'specialty_id' });

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty };
