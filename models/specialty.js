/**
 * Specialty Model
 * Corresponds to org.springframework.samples.petclinic.vet.Specialty
 */
module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false
  });
  return Specialty;
};
