/**
 * @module config/database
 * @description Configures and initializes the Sequelize ORM for database interaction.
 * Supports SQLite (default/H2 equivalent), MySQL, and PostgreSQL based on environment variables.
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load environment variables for database configuration
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';

let sequelize;

/**
 * @function configureSequelize
 * @description Configures the Sequelize instance based on the DB_DIALECT.
 */
function configureSequelize() {
  switch (DB_DIALECT) {
    case 'mysql':
      console.log('Configuring MySQL database...');
      sequelize = new Sequelize(
        process.env.MYSQL_DATABASE,
        process.env.MYSQL_USER,
        process.env.MYSQL_PASSWORD,
        {
          host: process.env.MYSQL_HOST,
          port: process.env.MYSQL_PORT,
          dialect: 'mysql',
          logging: false // Set to true to see SQL queries in console
        }
      );
      break;
    case 'postgres':
      console.log('Configuring PostgreSQL database...');
      sequelize = new Sequelize(
        process.env.POSTGRES_DATABASE,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        {
          host: process.env.POSTGRES_HOST,
          port: process.env.POSTGRES_PORT,
          dialect: 'postgres',
          logging: false // Set to true to see SQL queries in console
        }
      );
      break;
    case 'sqlite':
    default:
      console.log('Configuring SQLite (default) database...');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.SQLITE_STORAGE || path.join(__dirname, '..', 'data', 'petclinic.sqlite'),
        logging: false // Set to true to see SQL queries in console
      });
      break;
  }
}

configureSequelize();

// Define database models
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Owner = require('../models/owner')(sequelize, DataTypes);
db.PetType = require('../models/petType')(sequelize, DataTypes);
db.Pet = require('../models/pet')(sequelize, DataTypes);
db.Visit = require('../models/visit')(sequelize, DataTypes);
db.Vet = require('../models/vet')(sequelize, DataTypes);
db.Specialty = require('../models/specialty')(sequelize, DataTypes);
db.VetSpecialty = require('../models/vetSpecialty')(sequelize, DataTypes); // Junction table

// Establish associations
/**
 * @description Owner-Pet association: An owner can have many pets. A pet belongs to one owner.
 */
db.Owner.hasMany(db.Pet, {
  as: 'pets',
  foreignKey: 'ownerId',
  onDelete: 'CASCADE' // If an owner is deleted, their pets are also deleted
});
db.Pet.belongsTo(db.Owner, {
  as: 'owner',
  foreignKey: 'ownerId'
});

/**
 * @description Pet-PetType association: A pet has one type. A pet type can be associated with many pets.
 */
db.PetType.hasMany(db.Pet, {
  as: 'pets',
  foreignKey: 'typeId'
});
db.Pet.belongsTo(db.PetType, {
  as: 'type',
  foreignKey: 'typeId'
});

/**
 * @description Pet-Visit association: A pet can have many visits. A visit belongs to one pet.
 */
db.Pet.hasMany(db.Visit, {
  as: 'visits',
  foreignKey: 'petId',
  onDelete: 'CASCADE' // If a pet is deleted, its visits are also deleted
});
db.Visit.belongsTo(db.Pet, {
  as: 'pet',
  foreignKey: 'petId'
});

/**
 * @description Vet-Specialty Many-to-Many association: A vet can have many specialties, and a specialty can be held by many vets.
 * Uses a through table `VetSpecialty`.
 */
db.Vet.belongsToMany(db.Specialty, {
  through: db.VetSpecialty,
  foreignKey: 'vetId',
  otherKey: 'specialtyId',
  as: 'specialties'
});
db.Specialty.belongsToMany(db.Vet, {
  through: db.VetSpecialty,
  foreignKey: 'specialtyId',
  otherKey: 'vetId',
  as: 'vets'
});

module.exports = db;
