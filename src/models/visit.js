/**
 * Visit Model
 * Records a visit for a pet.
 */
module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false
  });

  return Visit;
};
