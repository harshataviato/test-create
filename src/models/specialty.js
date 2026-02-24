/**
 * Specialty Model (Radiology, Surgery, etc.)
 */
module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'specialties'
  });

  return Specialty;
};
