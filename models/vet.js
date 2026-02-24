/**
 * Vet Model
 * Represents a veterinarian. Inherits "Person" fields.
 */
module.exports = (sequelize, DataTypes) => {
  const Vet = sequelize.define('Vet', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'vets',
    timestamps: false
  });

  return Vet;
};
