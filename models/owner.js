/**
 * @module models/owner
 * @description Defines the Sequelize model for an Owner.
 * An Owner has a first name, last name, address, city, and telephone.
 */

/**
 * @function OwnerModel
 * @description Sequelize model definition for Owner.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The Owner model.
 */
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
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
    },
    address: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    telephone: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: /^\d{10}$/, // Basic 10-digit phone number validation
          msg: 'Telephone must be a 10-digit number.'
        }
      }
    }
  }, {
    tableName: 'Owners', // Explicitly define table name
    // Instance methods for full name
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      }
    }
  });

  // Associations will be defined in database.js
  Owner.associate = (models) => {
    // Owner.hasMany(models.Pet, { as: 'pets', foreignKey: 'ownerId' });
  };

  return Owner;
};
