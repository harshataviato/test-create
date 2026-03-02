/**
 * Pet Type Model (Cat, Dog, etc.)
 */
module.exports = (sequelize, DataTypes) => {
    const PetType = sequelize.define('type', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { timestamps: false });
    return PetType;
};
