/**
 * Pet Model
 * Represents a pet belonging to an owner. Matches the 'pets' table.
 */
module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false
    }
  });

  return Pet;
};
