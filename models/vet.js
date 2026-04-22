module.exports = (sequelize, DataTypes) => {
  const Vet = sequelize.define('Vet', {
    firstName: { type: DataTypes.STRING, field: 'first_name' },
    lastName: { type: DataTypes.STRING, field: 'last_name' }
  }, {
    tableName: 'vets',
    timestamps: false
  });
  return Vet;
};
