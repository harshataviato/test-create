/**
 * Database Initialization Strategy
 * 
 * Initializes Sequelize and imports all models.
 * Sets up associations (Foreign Keys) between entities.
 */
const Sequelize = require('sequelize');
const path = require('path');

// Using SQLite for the 'in-memory' feel of H2, but file-based for persistence
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'petclinic.sqlite',
  logging: false // Toggle true to see SQL queries
});

const db = {};

// Import Models
db.Owner = require('./owner')(sequelize, Sequelize);
db.Pet = require('./pet')(sequelize, Sequelize);
db.PetType = require('./petType')(sequelize, Sequelize);
db.Visit = require('./visit')(sequelize, Sequelize);
db.Vet = require('./vet')(sequelize, Sequelize);
db.Specialty = require('./specialty')(sequelize, Sequelize);

// Associations

// Owner <-> Pet (One-to-Many)
db.Owner.hasMany(db.Pet, { as: 'pets', foreignKey: 'ownerId' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'ownerId' });

// Pet <-> PetType (Many-to-One)
db.PetType.hasMany(db.Pet, { foreignKey: 'typeId' });
db.Pet.belongsTo(db.PetType, { as: 'type', foreignKey: 'typeId' });

// Pet <-> Visit (One-to-Many)
db.Pet.hasMany(db.Visit, { as: 'visits', foreignKey: 'petId' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'petId' });

// Vet <-> Specialty (Many-to-Many)
db.Vet.belongsToMany(db.Specialty, { through: 'VetSpecialties', as: 'specialties' });
db.Specialty.belongsToMany(db.Vet, { through: 'VetSpecialties' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
