/**
 * @fileoverview Base model for entities with an auto-incrementing ID.
 * This file defines the `BaseEntity` model which provides a common `id` field
 * for other models to extend. It mimics `BaseEntity.java`.
 */

/**
 * Defines the BaseEntity model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined BaseEntity model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the BaseEntity model.
    // It's defined as a regular model but can be extended by others.
    const BaseEntity = sequelize.define('BaseEntity', {
        id: {
            type: DataTypes.INTEGER, // Integer type
            autoIncrement: true,     // Auto-incrementing primary key
            primaryKey: true,        // Marks `id` as the primary key
            allowNull: false         // `id` cannot be null
        }
    }, {
        // Model options
        tableName: 'base_entities', // Explicit table name
        timestamps: false,         // Disable createdAt and updatedAt fields
        // Disabling `freezeTableName` prevents Sequelize from pluralizing the table name.
        // It's good practice to explicitly set `tableName` and `freezeTableName: true`.
        freezeTableName: true
    });

    /**
     * Helper method to check if the entity is new (i.e., not yet saved to the database).
     * This is an instance method attached to the BaseEntity prototype.
     * It mimics the `isNew()` method in the Java `BaseEntity`.
     * @returns {boolean} True if the entity's ID is null, indicating it's new.
     */
    BaseEntity.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return BaseEntity;
};
