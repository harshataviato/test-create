module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: DataTypes.STRING
  }, {
    tableName: 'types',
    timestamps: false
  });
  return PetType;
};
