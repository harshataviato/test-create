/**
 * Visit Model
 * Corresponds to org.springframework.samples.petclinic.owner.Visit
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
      allowNull: false,
      validate: { notEmpty: true }
    }
  });
  return Visit;
};
