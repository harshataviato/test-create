/**
 * Pet Model
 * Corresponds to org.springframework.samples.petclinic.owner.Pet
 */
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY, // Maps to LocalDate
      allowNull: false
    }
  });
  return Pet;
};
