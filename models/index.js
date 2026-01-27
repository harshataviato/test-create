/**
 * @fileoverview Aggregates all Sequelize models and defines their associations.
 * This file is crucial for setting up the ORM layer, including inheritance-like structures
 * and relationships between different entities (e.g., Owner has many Pets).
 */

const sequelize = require('../config/database'); // Sequelize instance
const { DataTypes } = require('sequelize'); // Sequelize data types

// Import all model definitions
const BaseEntity = require('./BaseEntity')(sequelize, DataTypes);
const NamedEntity = require('./NamedEntity')(sequelize, DataTypes);
const Person = require('./Person')(sequelize, DataTypes);
const Owner = require('./Owner')(sequelize, DataTypes);
const Pet = require('./Pet')(sequelize, DataTypes);
const PetType = require('./PetType')(sequelize, DataTypes);
const Visit = require('./Visit')(sequelize, DataTypes);
const Specialty = require('./Specialty')(sequelize, DataTypes);
const Vet = require('./Vet')(sequelize, DataTypes);

// --- Define Model Associations ---

// Owner and Pet: One-to-Many relationship (Owner has many Pets)
// When an Owner is deleted, all associated Pets are also deleted (CascadeType.ALL equivalent)
Owner.hasMany(Pet, { foreignKey: 'owner_id', as: 'pets', onDelete: 'CASCADE' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });

// Pet and PetType: Many-to-One relationship (Pet belongs to a PetType)
PetType.hasMany(Pet, { foreignKey: 'type_id', as: 'pets' });
Pet.belongsTo(PetType, { foreignKey: 'type_id', as: 'type' });

// Pet and Visit: One-to-Many relationship (Pet has many Visits)
// When a Pet is deleted, all associated Visits are also deleted (CascadeType.ALL equivalent)
Pet.hasMany(Visit, { foreignKey: 'pet_id', as: 'visits', onDelete: 'CASCADE' });
Visit.belongsTo(Pet, { foreignKey: 'pet_id', as: 'pet' });

// Vet and Specialty: Many-to-Many relationship (Vet has many Specialties, and a Specialty can belong to many Vets)
// This creates a join table 'vet_specialties'
Vet.belongsToMany(Specialty, { through: 'vet_specialties', foreignKey: 'vet_id', otherKey: 'specialty_id', as: 'specialties' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', foreignKey: 'specialty_id', otherKey: 'vet_id', as: 'vets' });


// Export all models
const db = {
  sequelize,
  BaseEntity,
  NamedEntity,
  Person,
  Owner,
  Pet,
  PetType,
  Visit,
  Specialty,
  Vet
};

module.exports = db;
