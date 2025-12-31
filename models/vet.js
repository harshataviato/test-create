/**
 * @module models/vet
 * @description Defines the Sequelize model for a Veterinarian (Vet).
 * A Vet has a first name and last name, and can have many Specialties.
 */

/**
 * @function VetModel
 * @description Sequelize model definition for Vet.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The Vet model.
 */
module.exports = (sequelize, DataTypes) => {
  const Vet = sequelize.define('Vet', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name is required.' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name is required.' }
      }
    }
  }, {
    tableName: 'Vets', // Explicitly define table name
    // Instance methods for full name
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    }
  });

  // Associations will be defined in database.js
  Vet.associate = (models) => {
    // Vet.belongsToMany(models.Specialty, { through: models.VetSpecialty, foreignKey: 'vetId' });
  };

  return Vet;
};
