module.exports = (sequelize, DataTypes) => {
  /**
   * Represents the Owner entity. Inherits from Person concept in Java.
   */
  const Owner = sequelize.define('Owner', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    telephone: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true,
        len: [10, 10]
      }
    }
  }, {
    tableName: 'owners',
    timestamps: false
  });

  return Owner;
};
