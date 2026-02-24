/**
 * Model Initialization and Association
 * 
 * Acts as the centralized definition of the Data Layer.
 * Equivalent to the JPA annotations (@Entity, @OneToMany, etc.) in the Java code.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Models
const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'types', timestamps: false });

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
}, { timestamps: false });

const Visit = sequelize.define('Visit', {
  visitDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

// --- Associations (Equivalent to @JoinColumn, @OneToMany, @ManyToMany) ---

// Vet N:M Specialty
Vet.belongsToMany(Specialty, { through: 'VetSpecialties', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'VetSpecialties', timestamps: false });

// Owner 1:N Pet
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId', onDelete: 'CASCADE' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

// PetType 1:N Pet
PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

// Pet 1:N Visit
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId', onDelete: 'CASCADE' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

module.exports = {
  sequelize,
  Vet,
  Specialty,
  PetType,
  Owner,
  Pet,
  Visit
};
