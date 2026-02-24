/**
 * PetType Model
 * Lookup table for pet types (e.g., cat, dog, bird).
 */
module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'types',
    timestamps: false
  });

  return PetType;
};
