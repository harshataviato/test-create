/**
 * Initializes Sequelize models and associations.
 */
const Sequelize = require('sequelize');
const config = require('../config/database.js')['development'];

const sequelize = new Sequelize(config);

const db = {};

// Import Models
db.Owner = require('./owner')(sequelize, Sequelize);
db.Pet = require('./pet')(sequelize, Sequelize);
db.PetType = require('./petType')(sequelize, Sequelize);
db.Visit = require('./visit')(sequelize, Sequelize);
db.Vet = require('./vet')(sequelize, Sequelize);
db.Specialty = require('./specialty')(sequelize, Sequelize);

// Define Associations
// -------------------

// Owner <-> Pet (One-to-Many)
db.Owner.hasMany(db.Pet, { as: 'pets', foreignKey: 'ownerId' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'ownerId', as: 'owner' });

// Pet <-> PetType (Many-to-One)
db.PetType.hasMany(db.Pet, { foreignKey: 'typeId' });
db.Pet.belongsTo(db.PetType, { foreignKey: 'typeId', as: 'type' });

// Pet <-> Visit (One-to-Many)
db.Pet.hasMany(db.Visit, { as: 'visits', foreignKey: 'petId' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'petId' });

// Vet <-> Specialty (Many-to-Many)
db.Vet.belongsToMany(db.Specialty, { through: 'VetSpecialties', as: 'specialties' });
db.Specialty.belongsToMany(db.Vet, { through: 'VetSpecialties' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
