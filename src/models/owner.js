/**
 * Owner Model
 * Represents a Pet Owner.
 */
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: true,
        isNumeric: true,
        len: [10, 10] // Ensures 10 digits
      }
    }
  }, {
    timestamps: false // Legacy schema doesn't usually track created_at/updated_at
  });

  return Owner;
};
