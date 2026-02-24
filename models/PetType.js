/**
 * PetType Model (e.g., Cat, Dog)
 */
module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return PetType;
};
