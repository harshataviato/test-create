/**
 * Visit Model
 * Represents a visit by a pet to the clinic. Matches 'visits' table.
 */
module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Visit;
};
