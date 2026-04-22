module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    name: DataTypes.STRING
  }, {
    tableName: 'specialties',
    timestamps: false
  });
  return Specialty;
};
