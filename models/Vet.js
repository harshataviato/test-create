/**
 * Vet Model
 * Represents a veterinarian.
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
  });
  return Vet;
};
