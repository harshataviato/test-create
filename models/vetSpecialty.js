/**
 * @module models/vetSpecialty
 * @description Defines the Sequelize model for the join table between Vets and Specialties.
 * This table manages the many-to-many relationship between veterinarians and their specializations.
 */

/**
 * @function VetSpecialtyModel
 * @description Sequelize model definition for VetSpecialty (junction table).
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The VetSpecialty model.
 */
module.exports = (sequelize, DataTypes) => {
  const VetSpecialty = sequelize.define('VetSpecialty', {
    vetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Vets', // refers to table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    specialtyId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Specialties', // refers to table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'VetSpecialties', // Explicitly define table name
    timestamps: true // Include createdAt and updatedAt fields
  });

  // No direct associations from the junction table itself in a typical setup.
  // The many-to-many is defined on Vet and Specialty models.
  return VetSpecialty;
};
