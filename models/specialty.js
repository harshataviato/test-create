/**
 * Specialty Model
 * Represents a vet's specialty (Radiology, Surgery, etc.).
 */
module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Specialty;
};
