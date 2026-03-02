/**
 * Pet Model
 */
module.exports = (sequelize, DataTypes) => {
    const Pet = sequelize.define('pet', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "Name is required" } }
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: { isDate: { msg: "Invalid date format" } }
        }
    });
    return Pet;
};
