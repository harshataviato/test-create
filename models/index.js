const { Sequelize, DataTypes } = require('sequelize');

/**
 * Senior Engineer Note: We use SQLite by default for zero-config startup,
 * but this configuration easily switches to Postgres or MySQL via ENV vars.
 */
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: './petclinic.sqlite',
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Owner = require('./owner')(sequelize, DataTypes);
db.Pet = require('./pet')(sequelize, DataTypes);
db.PetType = require('./petType')(sequelize, DataTypes);
db.Visit = require('./visit')(sequelize, DataTypes);
db.Vet = require('./vet')(sequelize, DataTypes);
db.Specialty = require('./specialty')(sequelize, DataTypes);

// Associations
db.Owner.hasMany(db.Pet, { foreignKey: 'owner_id', as: 'pets' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'owner_id' });

db.PetType.hasMany(db.Pet, { foreignKey: 'type_id' });
db.Pet.belongsTo(db.PetType, { foreignKey: 'type_id', as: 'type' });

db.Pet.hasMany(db.Visit, { foreignKey: 'pet_id', as: 'visits' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'pet_id' });

// Vet specialties (Many-to-Many)
db.Vet.belongsToMany(db.Specialty, { through: 'vet_specialties', foreignKey: 'vet_id' });
db.Specialty.belongsToMany(db.Vet, { through: 'vet_specialties', foreignKey: 'specialty_id' });

module.exports = db;
