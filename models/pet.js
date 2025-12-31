/**
 * @module models/pet
 * @description Defines the Sequelize model for a Pet.
 * A Pet belongs to an Owner and has a PetType, name, and birth date.
 */

/**
 * @function PetModel
 * @description Sequelize model definition for Pet.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The Pet model.
 */
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Pet name is required.' }
      }
    },
    birthDate: {
      type: DataTypes.DATEONLY, // Store only date, no time
      allowNull: false,
      validate: {
        isDate: { msg: 'Birth date must be a valid date.' },
        isBefore: {
          args: new Date().toISOString().split('T')[0], // Pet's birth date cannot be in the future
          msg: 'Birth date cannot be in the future.'
        }
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PetTypes', // refers to table name
        key: 'id',
      },
      validate: {
        notNull: { msg: 'Pet type is required.' },
        isInt: { msg: 'Invalid pet type.' }
      }
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Owners', // refers to table name
        key: 'id',
      },
      validate: {
        notNull: { msg: 'Owner is required.' },
        isInt: { msg: 'Invalid owner ID.' }
      }
    }
  }, {
    tableName: 'Pets' // Explicitly define table name
  });

  // Associations will be defined in database.js
  Pet.associate = (models) => {
    // Pet.belongsTo(models.Owner, { as: 'owner', foreignKey: 'ownerId' });
    // Pet.belongsTo(models.PetType, { as: 'type', foreignKey: 'typeId' });
    // Pet.hasMany(models.Visit, { as: 'visits', foreignKey: 'petId' });
  };

  return Pet;
};
