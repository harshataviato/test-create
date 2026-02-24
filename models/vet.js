/**
 * Vet Model
 * Corresponds to org.springframework.samples.petclinic.vet.Vet
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
    timestamps: false
  });
  return Vet;
};
