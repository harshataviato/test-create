/**
 * Sequelize Model Definitions and Associations.
 * 
 * Defines the schema for Owners, Pets, Visits, Vets, and Specialties.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// --- Define Models ---

const Owner = sequelize.define('Owner', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: false } // Digits only validation in Controller
});

const Pet = sequelize.define('Pet', {
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false } // e.g., cat, dog, hamster
});

const Visit = sequelize.define('Visit', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false }
});

const Vet = sequelize.define('Vet', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
});

const Specialty = sequelize.define('Specialty', {
  name: { type: DataTypes.STRING, allowNull: false }
});

// --- Define Associations ---

// Owner 1 -> N Pets
Owner.hasMany(Pet, { onDelete: 'CASCADE' });
Pet.belongsTo(Owner);

// Pet 1 -> N Visits
Pet.hasMany(Visit, { onDelete: 'CASCADE' });
Visit.belongsTo(Pet);

// Vet N <-> M Specialty
const VetSpecialties = sequelize.define('VetSpecialties', {}, { timestamps: false });
Vet.belongsToMany(Specialty, { through: VetSpecialties });
Specialty.belongsToMany(Vet, { through: VetSpecialties });

// Export everything
module.exports = {
  sequelize,
  Owner,
  Pet,
  Visit,
  Vet,
  Specialty
};
