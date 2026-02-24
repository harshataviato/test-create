/**
 * Specialty Model (e.g., Radiology, Surgery)
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
