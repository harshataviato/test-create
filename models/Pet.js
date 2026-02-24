/**
 * Pet Model
 */
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY, // Maps to Java LocalDate
      allowNull: false
    }
  });
  return Pet;
};
