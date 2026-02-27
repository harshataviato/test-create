const Owner = require('./Owner');
const Pet = require('./Pet');
const PetType = require('./PetType');
const Visit = require('./Visit');
const Vet = require('./Vet');
const Specialty = require('./Specialty');

/**
 * Senior Engineer Note: Association mapping is crucial for mirroring 
 * JPA's EAGER/LAZY fetching and Cascades.
 */

// Owner <-> Pet
Owner.hasMany(Pet, { onDelete: 'CASCADE' });
Pet.belongsTo(Owner);

// Pet <-> PetType
PetType.hasMany(Pet);
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

// Pet <-> Visit
Pet.hasMany(Visit, { onDelete: 'CASCADE' });
Visit.belongsTo(Pet);

// Vet <-> Specialty (Many-to-Many)
Vet.belongsToMany(Specialty, { through: 'vet_specialties' });
Specialty.belongsToMany(Vet, { through: 'vet_specialties' });

module.exports = { Owner, Pet, PetType, Visit, Vet, Specialty };
