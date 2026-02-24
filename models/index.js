/**
 * Model Index
 * 
 * Initializes all models and defines relationships (associations).
 * This acts as the JPA entity manager and mapping layer.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 1. Define Models

// Person (Base class logic moved to mixins or individual fields, 
// as Sequelize is not class-inheritance based in the same way as JPA)

const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'vets', timestamps: false });

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'specialties', timestamps: false });

const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'types', timestamps: false });

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'owners', timestamps: false });

const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, field: 'birth_date' }
}, { tableName: 'pets', timestamps: false });

const Visit = sequelize.define('Visit', {
  date: { type: DataTypes.DATEONLY, field: 'visit_date' },
  description: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'visits', timestamps: false });

// 2. Define Associations (Relationships)

// Vet N:M Specialty
Vet.belongsToMany(Specialty, { through: 'vet_specialties', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', timestamps: false });

// Owner 1:N Pet
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'owner_id', onDelete: 'CASCADE' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id' });

// Pet Type (Pet N:1 Type)
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'type_id' });

// Pet 1:N Visit
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'pet_id', onDelete: 'CASCADE' });
Visit.belongsTo(Pet, { foreignKey: 'pet_id' });

module.exports = {
  sequelize,
  Vet,
  Specialty,
  PetType,
  Owner,
  Pet,
  Visit
};
