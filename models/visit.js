module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    visitDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      field: 'visit_date'
    },
    description: DataTypes.STRING
  }, {
    tableName: 'visits',
    timestamps: false
  });
  return Visit;
};
