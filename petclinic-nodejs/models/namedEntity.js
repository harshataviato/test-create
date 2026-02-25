/**
 * @fileoverview Model for entities that have a `name` property and extend `BaseEntity`.
 * This file defines the `NamedEntity` model, which provides a `name` field
 * and inherits the `id` from `BaseEntity`. It mimics `NamedEntity.java`.
 */

const BaseEntity = require('./baseEntity'); // Import the BaseEntity model

/**
 * Defines the NamedEntity model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined NamedEntity model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the NamedEntity model, extending BaseEntity.
    // In Sequelize, this is achieved by defining a new model and manually linking its attributes,
    // or by letting other models inherit attributes explicitly.
    // For this case, we'll define it as a standalone model that implicitly extends BaseEntity
    // by having its own `id` which matches `BaseEntity`'s concept, or by inheriting via mixins if we were to get more complex.
    // For simplicity, we create a new table but conceptually it's "named".
    const NamedEntity = sequelize.define('NamedEntity', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(80), // String type with max length 80
            allowNull: false,          // `name` cannot be null
            validate: {
                notEmpty: true         // `name` cannot be empty
            }
        }
    }, {
        // Model options
        tableName: 'named_entities', // Explicit table name
        timestamps: false,           // Disable createdAt and updatedAt fields
        freezeTableName: true        // Prevent Sequelize from pluralizing
    });

    /**
     * Overrides the default `toString()` method.
     * This method provides a string representation of the NamedEntity,
     * primarily returning its `name`.
     * @returns {string} The name of the entity, or "<null>" if name is not set.
     */
    NamedEntity.prototype.toString = function() {
        return this.name !== null && this.name !== undefined ? this.name : '<null>';
    };

    // Add BaseEntity's isNew method directly, or redefine
    // In practice, this 'extension' is mostly conceptual, models inherit properties by design
    // rather than direct JS inheritance.
    NamedEntity.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return NamedEntity;
};
