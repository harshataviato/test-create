/**
 * Database Initialization and Relationships
 */
const { Sequelize, DataTypes } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';
const storage = process.env.DB_STORAGE || ':memory:';

const sequelize = new Sequelize({
  dialect: dialect,
  storage: storage,
  logging: false
});

// Define Base Models
const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
});

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
});

const PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
});

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { isNumeric: true, len: [10, 10] }
  }
});

const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
});

const Visit = sequelize.define('Visit', {
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.STRING, allowNull: false }
});

// Relationships
Vet.belongsToMany(Specialty, { through: 'vet_specialties' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties' });

PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { foreignKey: 'typeId', as: 'type' });

Owner.hasMany(Pet, { foreignKey: 'ownerId', as: 'pets' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

Pet.hasMany(Visit, { foreignKey: 'petId', as: 'visits' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

module.exports = { 
  sequelize, 
  Vet, Specialty, PetType, Owner, Pet, Visit 
};
