/**
 * Sequelize Initialization
 * 
 * Configures the database connection (SQLite for simplicity) and establishes
 * relationships between models.
 */
const Sequelize = require('sequelize');
const path = require('path');

// Using SQLite to mimic H2 in-memory/file behavior
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'petclinic.sqlite',
  logging: false // Turn off SQL logging for cleaner console
});

const db = {};

// Import models
db.Owner = require('./Owner')(sequelize, Sequelize);
db.Pet = require('./Pet')(sequelize, Sequelize);
db.PetType = require('./PetType')(sequelize, Sequelize);
db.Visit = require('./Visit')(sequelize, Sequelize);
db.Vet = require('./Vet')(sequelize, Sequelize);
db.Specialty = require('./Specialty')(sequelize, Sequelize);

// Define Associations (Equivalent to JPA annotations @OneToMany, @ManyToOne, etc.)

// Owner -> Pets
db.Owner.hasMany(db.Pet, { as: 'pets', foreignKey: 'ownerId' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'ownerId' });

// Pet -> Type
db.PetType.hasMany(db.Pet, { foreignKey: 'typeId' });
db.Pet.belongsTo(db.PetType, { as: 'type', foreignKey: 'typeId' });

// Pet -> Visits
db.Pet.hasMany(db.Visit, { as: 'visits', foreignKey: 'petId' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'petId' });

// Vet -> Specialties (Many-to-Many)
db.Vet.belongsToMany(db.Specialty, { through: 'VetSpecialties', as: 'specialties' });
db.Specialty.belongsToMany(db.Vet, { through: 'VetSpecialties' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
