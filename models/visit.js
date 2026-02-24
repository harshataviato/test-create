/**
 * Visit Model
 * Records a visit for a specific Pet.
 */
module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: true }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Description is required' } }
    }
  }, {
    tableName: 'visits'
  });

  return Visit;
};
