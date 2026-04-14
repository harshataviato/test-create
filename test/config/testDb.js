// test/config/testDb.js
const { Sequelize } = require('sequelize');
const path = require('path');
const moment = require('moment');

// Load test environment variables from .env.test
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });

const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgres://petclinic:petclinic@localhost:5432/petclinic_test';

const sequelize = new Sequelize(DATABASE_URL_TEST, {
  dialect: 'postgres',
  logging: false, // Suppress SQL logging in tests
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true
  }
});

// Import and initialize all models using this test Sequelize instance
// This ensures that model definitions and associations are loaded correctly
// for direct use in model and service tests, separate from the main app.
const BaseEntity = require('../../src/models/baseEntity');
const NamedEntity = require('../../src/models/namedEntity');
const Person = require('../../src/models/person');
const Owner = require('../../src/models/owner');
const Pet = require('../../src/models/pet');
const PetType = require('../../src/models/petType');
const Specialty = require('../../src/models/specialty');
const Vet = require('../../src/models/vet');
const Visit = require('../../src/models/visit');

BaseEntity.initialize(sequelize);
NamedEntity.initialize(sequelize);
Person.initialize(sequelize);
Owner.initialize(sequelize);
PetType.initialize(sequelize);
Pet.initialize(sequelize);
Specialty.initialize(sequelize);
Vet.initialize(sequelize);
Visit.initialize(sequelize);

// Define associations (must be defined after all models are initialized)
Owner.hasMany(Pet, { foreignKey: 'owner_id', as: 'pets' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });

PetType.hasMany(Pet, { foreignKey: 'type_id', as: 'pets' });
Pet.belongsTo(PetType, { foreignKey: 'type_id', as: 'type' });

Pet.hasMany(Visit, { foreignKey: 'pet_id', as: 'visits' });
Visit.belongsTo(Pet, { foreignKey: 'pet_id', as: 'pet' });

Vet.belongsToMany(Specialty, {
  through: 'vet_specialties', // Junction table name
  foreignKey: 'vet_id',
  otherKey: 'specialty_id',
  as: 'specialties'
});
Specialty.belongsToMany(Vet, {
  through: 'vet_specialties', // Junction table name
  foreignKey: 'specialty_id',
  otherKey: 'vet_id',
  as: 'vets'
});

module.exports = sequelize;
module.exports.models = {
  BaseEntity, // Export BaseEntity for testing its methods
  NamedEntity, // Export NamedEntity for testing its methods
  Person, // Export Person for testing its methods
  Owner,
  Pet,
  PetType,
  Specialty,
  Vet,
  Visit,
};
module.exports.ejs = { // For EJS template rendering compatibility if needed in tests
  moment: moment
};
