/**
 * Pet Model
 * Represents a pet. Linked to Owner and PetType.
 */
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } }
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { 
        notEmpty: { msg: 'Birth date is required' },
        isDate: { msg: 'Invalid date format' }
      }
    }
  }, {
    tableName: 'pets'
  });

  return Pet;
};
