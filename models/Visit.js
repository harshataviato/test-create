/**
 * Visit Model
 * Records a visit to the clinic.
 */
module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return Visit;
};
