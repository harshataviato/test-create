/**
 * Vet Model
 */
module.exports = (sequelize, DataTypes) => {
    const Vet = sequelize.define('vet', {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        indexes: [{ fields: ['lastName'] }]
    });
    return Vet;
};
