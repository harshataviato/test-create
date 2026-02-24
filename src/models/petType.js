/**
 * PetType Model (Cat, Dog, Hamster, etc.)
 */
module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'types' // Matching SQL schema name
  });

  return PetType;
};
