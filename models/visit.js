/**
 * @module models/visit
 * @description Defines the Sequelize model for a Pet's Visit to the clinic.
 * A Visit belongs to a Pet and records the date and a description of the visit.
 */

/**
 * @function VisitModel
 * @description Sequelize model definition for Visit.
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @param {import('sequelize').DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {import('sequelize').Model} The Visit model.
 */
module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pets', // refers to table name
        key: 'id',
      },
      validate: {
        notNull: { msg: 'Pet ID is required for a visit.' }
      }
    },
    visitDate: {
      type: DataTypes.DATEONLY, // Store only date, no time
      allowNull: false,
      validate: {
        isDate: { msg: 'Visit date must be a valid date.' },
        isBefore: {
          args: new Date().toISOString().split('T')[0], // Visit date cannot be in the future
          msg: 'Visit date cannot be in the future.'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Visit description is required.' },
        len: {
          args: [3, 255], // Description length between 3 and 255 characters
          msg: 'Description must be between 3 and 255 characters.'
        }
      }
    }
  }, {
    tableName: 'Visits' // Explicitly define table name
  });

  // Associations will be defined in database.js
  Visit.associate = (models) => {
    // Visit.belongsTo(models.Pet, { as: 'pet', foreignKey: 'petId' });
  };

  return Visit;
};
