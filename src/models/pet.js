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
      type: DataTypes.DATEONLY, // Store as YYYY-MM-DD
      allowNull: false
    }
  }, {
    timestamps: false
  });

  return Pet;
};
