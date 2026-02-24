/**
 * Model Index
 * Initializes models and defines associations (Relationships).
 */
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import Model Definitions
const OwnerModel = require('./owner');
const PetModel = require('./pet');
const PetTypeModel = require('./petType');
const VetModel = require('./vet');
const SpecialtyModel = require('./specialty');
const VisitModel = require('./visit');

// Initialize Models
const Owner = OwnerModel(sequelize, DataTypes);
const Pet = PetModel(sequelize, DataTypes);
const PetType = PetTypeModel(sequelize, DataTypes);
const Vet = VetModel(sequelize, DataTypes);
const Specialty = SpecialtyModel(sequelize, DataTypes);
const Visit = VisitModel(sequelize, DataTypes);

// Define Associations

// Owner <-> Pet (1:N)
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

// PetType <-> Pet (1:N)
PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

// Pet <-> Visit (1:N)
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

// Vet <-> Specialty (N:M)
Vet.belongsToMany(Specialty, { through: 'VetSpecialties', as: 'specialties' });
Specialty.belongsToMany(Vet, { through: 'VetSpecialties' });

module.exports = {
  sequelize,
  Owner,
  Pet,
  PetType,
  Vet,
  Specialty,
  Visit
};
