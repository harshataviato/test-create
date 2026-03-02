/**
 * Specialty Model (Radiology, etc.)
 */
module.exports = (sequelize, DataTypes) => {
    const Specialty = sequelize.define('specialty', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { timestamps: false });
    return Specialty;
};
