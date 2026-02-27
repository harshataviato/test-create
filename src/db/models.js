const { Sequelize, DataTypes, Model } = require('sequelize');
const path = require('path');

/**
 * Pragmatic Database initialization using SQLite for easy deployment
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../petclinic.sqlite'),
    logging: false
});

// --- Base Models ---

class PetType extends Model {}
PetType.init({
    name: DataTypes.STRING
}, { sequelize, modelName: 'type' });

class Owner extends Model {}
Owner.init({
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'owner' });

class Pet extends Model {}
Pet.init({
    name: DataTypes.STRING,
    birthDate: DataTypes.DATEONLY
}, { sequelize, modelName: 'pet' });

class Visit extends Model {}
Visit.init({
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    description: DataTypes.STRING
}, { sequelize, modelName: 'visit' });

class Vet extends Model {}
Vet.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
}, { sequelize, modelName: 'vet' });

class Specialty extends Model {}
Specialty.init({
    name: DataTypes.STRING
}, { sequelize, modelName: 'specialty' });

// --- Associations ---

Owner.hasMany(Pet, { onDelete: 'CASCADE' });
Pet.belongsTo(Owner);

PetType.hasMany(Pet);
Pet.belongsTo(PetType);

Pet.hasMany(Visit, { onDelete: 'CASCADE' });
Visit.belongsTo(Pet);

Vet.belongsToMany(Specialty, { through: 'vet_specialties' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties' });

module.exports = { sequelize, Owner, Pet, PetType, Visit, Vet, Specialty };
