/**
 * Models Initialization & Association Setup.
 */
const db = require('../config/database');
const Sequelize = db.Sequelize;
const sequelize = db.sequelize;

// Import Definitions
const OwnerModel = require('./owner')(sequelize, Sequelize);
const PetModel = require('./pet')(sequelize, Sequelize);
const PetTypeModel = require('./petType')(sequelize, Sequelize);
const VisitModel = require('./visit')(sequelize, Sequelize);
const VetModel = require('./vet')(sequelize, Sequelize);
const SpecialtyModel = require('./specialty')(sequelize, Sequelize);

// Associations

// Owner <-> Pet
OwnerModel.hasMany(PetModel, { as: 'pets', foreignKey: 'ownerId', onDelete: 'CASCADE' });
PetModel.belongsTo(OwnerModel, { as: 'owner', foreignKey: 'ownerId' });

// Pet <-> PetType
PetTypeModel.hasMany(PetModel, { foreignKey: 'typeId' });
PetModel.belongsTo(PetTypeModel, { as: 'type', foreignKey: 'typeId' });

// Pet <-> Visit
PetModel.hasMany(VisitModel, { as: 'visits', foreignKey: 'petId', onDelete: 'CASCADE' });
VisitModel.belongsTo(PetModel, { foreignKey: 'petId' });

// Vet <-> Specialty (Many-to-Many)
VetModel.belongsToMany(SpecialtyModel, { through: 'vet_specialties', as: 'specialties', foreignKey: 'vetId' });
SpecialtyModel.belongsToMany(VetModel, { through: 'vet_specialties', foreignKey: 'specialtyId' });

const models = {
    Owner: OwnerModel,
    Pet: PetModel,
    PetType: PetTypeModel,
    Visit: VisitModel,
    Vet: VetModel,
    Specialty: SpecialtyModel
};

module.exports = models;
