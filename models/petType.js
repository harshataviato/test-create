/**
 * PetType Model
 * Represents the type of animal (Cat, Dog, etc.). Matches 'types' table.
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
