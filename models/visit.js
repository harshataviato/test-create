/**
 * Visit Model
 */
module.exports = (sequelize, DataTypes) => {
    const Visit = sequelize.define('visit', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: { isDate: { msg: "Invalid date" } }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "Description is required" } }
        }
    });
    return Visit;
};
