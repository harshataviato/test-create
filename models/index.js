/**
 * Main model initialization file.
 * Defines relationships between entities.
 */
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// --- Define Models ---

// Person is not a table in the original, but a MappedSuperclass. 
// In Sequelize, we define fields directly on the children or use composition.
// We will define fields directly for simplicity.

const Vet = sequelize.define('Vet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'vets', timestamps: false });

const Specialty = sequelize.define('Specialty', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'specialties', timestamps: false });

const PetType = sequelize.define('PetType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'types', timestamps: false });

const Owner = sequelize.define('Owner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'owners', timestamps: false });

const Pet = sequelize.define('Pet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    birthDate: { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'pets', timestamps: false });

const Visit = sequelize.define('Visit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'visits', timestamps: false });

// --- Define Relationships ---

// Vets <-> Specialties (Many-to-Many)
Vet.belongsToMany(Specialty, { through: 'vet_specialties', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', timestamps: false });

// Owner <-> Pets (One-to-Many)
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'owner_id', onDelete: 'CASCADE' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id' });

// PetType <-> Pets (One-to-Many)
PetType.hasMany(Pet, { foreignKey: 'type_id' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'type_id' });

// Pet <-> Visits (One-to-Many)
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
