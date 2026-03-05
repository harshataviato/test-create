/**
 * Database Configuration and Model Aggregator
 * Uses SQLite by default to match Spring's H2 behavior
 */
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.sqlite',
  logging: false
});

// Define Base Models
const PetType = sequelize.define('PetType', {
  name: DataTypes.STRING
}, { tableName: 'types', timestamps: false });

const Specialty = sequelize.define('Specialty', {
  name: DataTypes.STRING
}, { tableName: 'specialties', timestamps: false });

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' },
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  telephone: DataTypes.STRING
}, { tableName: 'owners', timestamps: false });

const Pet = sequelize.define('Pet', {
  name: DataTypes.STRING,
  birthDate: { type: DataTypes.DATEONLY, field: 'birth_date' }
}, { tableName: 'pets', timestamps: false });

const Visit = sequelize.define('Visit', {
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW, field: 'visit_date' },
  description: DataTypes.STRING
}, { tableName: 'visits', timestamps: false });

const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' }
}, { tableName: 'vets', timestamps: false });

// Define Associations (Relationships)
Owner.hasMany(Pet, { foreignKey: 'owner_id', as: 'pets' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id' });

PetType.hasMany(Pet, { foreignKey: 'type_id' });
Pet.belongsTo(PetType, { foreignKey: 'type_id', as: 'type' });

Pet.hasMany(Visit, { foreignKey: 'pet_id', as: 'visits' });
Visit.belongsTo(Pet, { foreignKey: 'pet_id' });

Vet.belongsToMany(Specialty, { through: 'vet_specialties', foreignKey: 'vet_id', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', foreignKey: 'specialty_id', timestamps: false });

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty };
