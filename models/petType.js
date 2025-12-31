/**
 * @module models/petType
 * @description Defines the Sequelize model for a PetType.
 * PetType stores the different classifications of pets (e.g., Cat, Dog, Bird).
 */

/**
 * @function PetTypeModel
 * @description Sequelize model definition for PetType.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The PetType model.
 */
module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Pet types should be unique
      validate: {
        notEmpty: { msg: 'Pet type name is required.' }
      }
    }
  }, {
    tableName: 'PetTypes' // Explicitly define table name
  });

  // Associations will be defined in database.js
  PetType.associate = (models) => {
    // PetType.hasMany(models.Pet, { as: 'pets', foreignKey: 'typeId' });
  };

  return PetType;
};
