const { Sequelize, DataTypes } = require('sequelize');

/**
 * Database initialization.
 * Using SQLite as it mimics the H2 in-memory behavior of the original Java app
 * while providing persistence between restarts.
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './petclinic.db',
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- Model Definitions ---

// Base entity logic is mixed into these definitions directly for simplicity
db.PetType = sequelize.define('PetType', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'types' });

db.Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'specialties' });

db.Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { isNumeric: true, len: [10, 10] }
  }
}, { tableName: 'owners' });

db.Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'pets' });

db.Visit = sequelize.define('Visit', {
  visitDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'visits' });

db.Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'vets' });

// --- Associations (Replicating JPA mappings) ---

db.Owner.hasMany(db.Pet, { foreignKey: 'owner_id', as: 'pets' });
db.Pet.belongsTo(db.Owner, { foreignKey: 'owner_id' });

db.PetType.hasMany(db.Pet, { foreignKey: 'type_id' });
db.Pet.belongsTo(db.PetType, { foreignKey: 'type_id', as: 'type' });

db.Pet.hasMany(db.Visit, { foreignKey: 'pet_id', as: 'visits' });
db.Visit.belongsTo(db.Pet, { foreignKey: 'pet_id' });

// Many-to-Many Vets and Specialties
db.Vet.belongsToMany(db.Specialty, { through: 'vet_specialties', as: 'specialties', foreignKey: 'vet_id' });
db.Specialty.belongsToMany(db.Vet, { through: 'vet_specialties', foreignKey: 'specialty_id' });

/**
 * Initial Data Seeder.
 * Equivalent to data.sql in the Spring version.
 */
db.seed = async () => {
  const typeCount = await db.PetType.count();
  if (typeCount > 0) return; // Prevent double seeding

  const cats = await db.PetType.create({ name: 'cat' });
  const dogs = await db.PetType.create({ name: 'dog' });
  
  const radiology = await db.Specialty.create({ name: 'radiology' });
  const surgery = await db.Specialty.create({ name: 'surgery' });

  const owner = await db.Owner.create({
    firstName: 'George', lastName: 'Franklin', 
    address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023'
  });

  const pet = await db.Pet.create({
    name: 'Leo', birthDate: '2010-09-07', type_id: cats.id, owner_id: owner.id
  });

  await db.Visit.create({
    pet_id: pet.id, visitDate: '2013-01-01', description: 'rabies shot'
  });

  const vet = await db.Vet.create({ firstName: 'James', lastName: 'Carter' });
  await vet.addSpecialty(radiology);
};

module.exports = db;
