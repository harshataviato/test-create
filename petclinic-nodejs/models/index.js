/**
 * @fileoverview Centralized module for Sequelize models.
 * This file initializes Sequelize, imports all defined models,
 * defines their associations, and exports them.
 */

const Sequelize = require('sequelize'); // Import Sequelize
const sequelize = require('../config/db'); // Import the pre-configured Sequelize instance

const db = {}; // Object to hold all models and the sequelize instance

// --- Import Models ---
// Import each model definition. The `define` method will be called on `sequelize` for each.
db.BaseEntity = require('./baseEntity')(sequelize, Sequelize);
db.NamedEntity = require('./namedEntity')(sequelize, Sequelize);
db.Person = require('./person')(sequelize, Sequelize);
db.Owner = require('./owner')(sequelize, Sequelize);
db.PetType = require('./petType')(sequelize, Sequelize);
db.Pet = require('./pet')(sequelize, Sequelize);
db.Visit = require('./visit')(sequelize, Sequelize);
db.Specialty = require('./specialty')(sequelize, Sequelize);
db.Vet = require('./vet')(sequelize, Sequelize);

// --- Define Associations ---

/**
 * Associations for Owner model.
 * An Owner can have many Pets (one-to-many relationship).
 * `ownerId` is the foreign key in the `pets` table.
 */
db.Owner.hasMany(db.Pet, {
  as: 'pets', // Alias for the association
  foreignKey: 'ownerId', // Foreign key in the Pet model
  onDelete: 'CASCADE' // If an owner is deleted, their pets are also deleted
});
db.Pet.belongsTo(db.Owner, { foreignKey: 'ownerId' }); // Pet belongs to an Owner

/**
 * Associations for Pet model.
 * A Pet has one PetType (many-to-one relationship).
 * `typeId` is the foreign key in the `pets` table.
 * A Pet can have many Visits (one-to-many relationship).
 * `petId` is the foreign key in the `visits` table.
 */
db.Pet.belongsTo(db.PetType, { foreignKey: 'typeId', as: 'type' }); // Pet belongs to a PetType
db.PetType.hasMany(db.Pet, { foreignKey: 'typeId' }); // PetType can have many Pets

db.Pet.hasMany(db.Visit, {
  as: 'visits', // Alias for the association
  foreignKey: 'petId', // Foreign key in the Visit model
  onDelete: 'CASCADE' // If a pet is deleted, its visits are also deleted
});
db.Visit.belongsTo(db.Pet, { foreignKey: 'petId' }); // Visit belongs to a Pet

/**
 * Associations for Vet model.
 * A Vet can have many Specialties, and a Specialty can belong to many Vets (many-to-many relationship).
 * This requires a through table (`vet_specialties`).
 */
db.Vet.belongsToMany(db.Specialty, {
  through: 'vet_specialties', // Name of the join table
  foreignKey: 'vetId', // Foreign key in `vet_specialties` that refers to `Vet`
  otherKey: 'specialtyId', // Foreign key in `vet_specialties` that refers to `Specialty`
  as: 'specialties' // Alias for the association
});
db.Specialty.belongsToMany(db.Vet, {
  through: 'vet_specialties',
  foreignKey: 'specialtyId',
  otherKey: 'vetId',
  as: 'vets'
});

// --- Export Sequelize instance and models ---
db.sequelize = sequelize; // The configured Sequelize instance
db.Sequelize = Sequelize; // The Sequelize library itself

module.exports = db; // Export the database object containing all models and Sequelize
