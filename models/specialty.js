/**
 * Specialty Model
 * Specialties for Vets (e.g., radiology, surgery).
 */
module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'specialties',
    timestamps: false
  });

  return Specialty;
};
