module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    name: DataTypes.STRING,
    birthDate: {
      type: DataTypes.DATEONLY,
      field: 'birth_date'
    }
  }, {
    tableName: 'pets',
    timestamps: false
  });
  return Pet;
};
