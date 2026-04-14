/**
 * @file database.js
 * @description Configures and connects to the PostgreSQL database using Sequelize.
 * It also defines and initializes all Sequelize models.
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const moment = require('moment'); // For date formatting in templates

// Load environment variables for database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://petclinic:petclinic@localhost:5432/petclinic';

/**
 * @constant sequelize
 * @description Sequelize instance for database connection.
 * Uses the DATABASE_URL environment variable for connection details.
 */
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to true to see SQL queries in console
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Ensure dates are parsed correctly, can be useful with specific client libraries
  dialectOptions: {
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false // Adjust for production if you have a valid cert
    // }
  },
  // Add moment for date formatting in EJS templates globally
  define: {
    // Underscored option adds the underscore style for automatically generated attributes
    // (createdAt, updatedAt) and also for attribute names.
    underscored: true
  }
});

// Import models
const BaseEntity = require('../models/baseEntity');
const NamedEntity = require('../models/namedEntity');
const Person = require('../models/person');
const Owner = require('../models/owner');
const Pet = require('../models/pet');
const PetType = require('../models/petType');
const Specialty = require('../models/specialty');
const Vet = require('../models/vet');
const Visit = require('../models/visit');

/**
 * @function initializeModels
 * @description Initializes all Sequelize models with the Sequelize instance.
 * Defines associations between models.
 */
const initializeModels = () => {
  // Initialize base models - these are more like mixins in JS
  BaseEntity.initialize(sequelize);
  NamedEntity.initialize(sequelize);
  Person.initialize(sequelize);

  // Initialize concrete models
  Owner.initialize(sequelize);
  PetType.initialize(sequelize);
  Pet.initialize(sequelize);
  Specialty.initialize(sequelize);
  Vet.initialize(sequelize);
  Visit.initialize(sequelize);

  // Define associations

  // Owner - Pet (One-to-Many)
  Owner.hasMany(Pet, { foreignKey: 'owner_id', as: 'pets' });
  Pet.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });

  // Pet - PetType (Many-to-One)
  PetType.hasMany(Pet, { foreignKey: 'type_id', as: 'pets' });
  Pet.belongsTo(PetType, { foreignKey: 'type_id', as: 'type' });

  // Pet - Visit (One-to-Many)
  Pet.hasMany(Visit, { foreignKey: 'pet_id', as: 'visits' });
  Visit.belongsTo(Pet, { foreignKey: 'pet_id', as: 'pet' });

  // Vet - Specialty (Many-to-Many)
  Vet.belongsToMany(Specialty, {
    through: 'vet_specialties', // Junction table
    foreignKey: 'vet_id',
    otherKey: 'specialty_id',
    as: 'specialties'
  });
  Specialty.belongsToMany(Vet, {
    through: 'vet_specialties', // Junction table
    foreignKey: 'specialty_id',
    otherKey: 'vet_id',
    as: 'vets'
  });

  // Export models
  module.exports.models = {
    Owner,
    Pet,
    PetType,
    Specialty,
    Vet,
    Visit,
    // Base entities are mostly for inheritance, not direct export
  };
};

initializeModels(); // Call to initialize models and associations

// Expose models and sequelize instance
module.exports = sequelize;

// Utility for EJS to use moment.js (similar to Thymeleaf's #temporals)
module.exports.ejs = {
  moment: moment
};
