/**
 * @module models/specialty
 * @description Defines the Sequelize model for a Vet's Specialty.
 * Specialties describe areas of expertise for veterinarians (e.g., Radiology, Surgery).
 */

/**
 * @function SpecialtyModel
 * @description Sequelize model definition for Specialty.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The Specialty model.
 */
module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Specialty names should be unique
      validate: {
        notEmpty: { msg: 'Specialty name is required.' }
      }
    }
  }, {
    tableName: 'Specialties' // Explicitly define table name
  });

  // Associations will be defined in database.js
  Specialty.associate = (models) => {
    // Specialty.belongsToMany(models.Vet, { through: models.VetSpecialty, foreignKey: 'specialtyId' });
  };

  return Specialty;
};
