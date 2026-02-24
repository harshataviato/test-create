/**
 * PetType Model
 * Corresponds to org.springframework.samples.petclinic.owner.PetType
 */
module.exports = (sequelize, DataTypes) => {
  const PetType = sequelize.define('PetType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false 
  });
  return PetType;
};
