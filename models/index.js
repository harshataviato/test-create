/**
 * Sequelize initialization.
 * Loads all models and defines relationships.
 */
const Sequelize = require('sequelize');
const config = require('../config/database');

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.Owner = require('./owner')(sequelize, Sequelize);
db.Pet = require('./pet')(sequelize, Sequelize);
db.PetType = require('./petType')(sequelize, Sequelize);
db.Visit = require('./visit')(sequelize, Sequelize);
db.Vet = require('./vet')(sequelize, Sequelize);
db.Specialty = require('./specialty')(sequelize, Sequelize);

// Relationships

// Owner -> Pet
db.Owner.hasMany(db.Pet, { foreignKey: 'owner_id', as: 'pets' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'owner_id', as: 'owner' });

// Pet -> PetType
db.PetType.hasMany(db.Pet, { foreignKey: 'type_id' });
db.Pet.belongsTo(db.PetType, { foreignKey: 'type_id', as: 'type' });

// Pet -> Visit
db.Pet.hasMany(db.Visit, { foreignKey: 'pet_id', as: 'visits' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'pet_id' });

// Vet <-> Specialty (Many-to-Many)
db.Vet.belongsToMany(db.Specialty, { through: 'vet_specialties', foreignKey: 'vet_id', as: 'specialties' });
db.Specialty.belongsToMany(db.Vet, { through: 'vet_specialties', foreignKey: 'specialty_id' });

module.exports = db;
