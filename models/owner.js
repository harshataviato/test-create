/**
 * Owner Model
 * Represents a Pet Owner.
 */
module.exports = (sequelize, DataTypes) => {
    const Owner = sequelize.define('owner', {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "First Name is required" } }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "Last Name is required" } }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "Address is required" } }
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: "City is required" } }
        },
        telephone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { 
                notEmpty: { msg: "Telephone is required" },
                isNumeric: { msg: "Telephone must be numeric" },
                len: { args: [10, 10], msg: "Telephone must be 10 digits" }
            }
        }
    }, {
        indexes: [{ fields: ['lastName'] }]
    });
    return Owner;
};
