import sequelize from '../config/database.js';
import { DataTypes, Model } from 'sequelize';

/**
 * Define Models
 * These mirror the JPA Entities found in the Java codebase.
 */

// Base Person model properties are merged into Owner and Vet directly
// as Sequelize doesn't support MappedSuperclass inheritance exactly like JPA.

export class Owner extends Model {}
Owner.init({
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { isNumeric: true, len: [10, 10] } // Basic validation
  }
}, { sequelize, modelName: 'owner', timestamps: false });

export class PetType extends Model {}
PetType.init({
  name: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'type', tableName: 'types', timestamps: false });

export class Pet extends Model {}
Pet.init({
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
}, { sequelize, modelName: 'pet', timestamps: false });

export class Visit extends Model {}
Visit.init({
  date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'visit', timestamps: false });

export class Vet extends Model {}
Vet.init({
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'vet', timestamps: false });

export class Specialty extends Model {}
Specialty.init({
  name: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'specialty', tableName: 'specialties', timestamps: false });

// Relationships (Associations)

// Owner -> Pets (One-to-Many)
Owner.hasMany(Pet, { as: 'pets', foreignKey: 'ownerId' });
Pet.belongsTo(Owner, { foreignKey: 'ownerId' });

// Pet -> Type (Many-to-One)
PetType.hasMany(Pet, { foreignKey: 'typeId' });
Pet.belongsTo(PetType, { as: 'type', foreignKey: 'typeId' });

// Pet -> Visits (One-to-Many)
Pet.hasMany(Visit, { as: 'visits', foreignKey: 'petId' });
Visit.belongsTo(Pet, { foreignKey: 'petId' });

// Vet -> Specialties (Many-to-Many)
const VetSpecialties = sequelize.define('VetSpecialties', {}, { timestamps: false });
Vet.belongsToMany(Specialty, { through: VetSpecialties, as: 'specialties' });
Specialty.belongsToMany(Vet, { through: VetSpecialties });

export { sequelize };
