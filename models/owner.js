/**
 * Owner Model
 * Represents a pet owner. Inherits "Person" fields (firstName, lastName).
 */
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'First name is required' } }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Last name is required' } }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Address is required' } }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'City is required' } }
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Telephone is required' },
        isNumeric: { msg: 'Telephone must be numeric' },
        len: { args: [10, 10], msg: 'Telephone must be a 10-digit number' }
      }
    }
  }, {
    tableName: 'owners'
  });

  return Owner;
};
