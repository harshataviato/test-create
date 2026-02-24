/**
 * Central Model Definitions and Associations.
 */
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// --- Define Models ---

const Vet = sequelize.define('Vet', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: 'vets' });

const Specialty = sequelize.define('Specialty', {
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: 'specialties' });

const PetType = sequelize.define('PetType', {
    name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: 'types' });

const Owner = sequelize.define('Owner', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: 'owners' });

const Pet = sequelize.define('Pet', {
    name: { type: DataTypes.STRING, allowNull: false },
    birthDate: { type: DataTypes.DATEONLY, field: 'birth_date' }
}, { timestamps: false, tableName: 'pets' });

const Visit = sequelize.define('Visit', {
    date: { type: DataTypes.DATEONLY, field: 'visit_date' },
    description: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: 'visits' });

// --- Define Relationships ---

// Vets <-> Specialties (Many-to-Many)
Vet.belongsToMany(Specialty, { through: 'vet_specialties', timestamps: false });
Specialty.belongsToMany(Vet, { through: 'vet_specialties', timestamps: false });

// Owner -> Pets (One-to-Many)
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'owner_id' });
Pet.belongsTo(Owner, { foreignKey: 'owner_id' });

// Pet -> Type (Many-to-One)
PetType.hasMany(Pet, { foreignKey: 'type_id' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'type_id' });

// Pet -> Visits (One-to-Many)
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'pet_id' });
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
