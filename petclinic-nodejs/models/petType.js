/**
 * @fileoverview PetType model, representing different types of pets.
 * This file defines the `PetType` model, which includes a `name` field
 * and inherits the `id` from `BaseEntity`. It mimics `PetType.java`.
 */

const NamedEntity = require('./namedEntity'); // Import the NamedEntity model

/**
 * Defines the PetType model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined PetType model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the PetType model, conceptually extending NamedEntity.
    // In Sequelize, this means defining a new model with its own `id` as PK,
    // and including `name` as a regular attribute.
    const PetType = sequelize.define('PetType', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(80), // String type with max length 80
            allowNull: false,
            validate: { notEmpty: true },
            unique: true // Pet type names should be unique
        }
    }, {
        // Model options
        tableName: 'types', // Explicit table name
        timestamps: false,  // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the PetType model.
     * A PetType can have many Pets.
     * @param {object} models - Object containing all defined Sequelize models.
     */
    PetType.associate = (models) => {
        PetType.hasMany(models.Pet, { foreignKey: 'typeId' });
    };

    /**
     * Checks if the pet type entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    PetType.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return PetType;
};
