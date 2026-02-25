/**
 * @fileoverview Model for entities representing a person, extending `BaseEntity`.
 * This file defines the `Person` model, which includes `firstName` and `lastName` fields
 * and inherits the `id` from `BaseEntity`. It mimics `Person.java`.
 */

const BaseEntity = require('./baseEntity'); // Import the BaseEntity model

/**
 * Defines the Person model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Person model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Person model, conceptually extending BaseEntity.
    // In Sequelize, when a model 'extends' another with shared PK, it often means
    // it shares the same PK generation strategy or includes common fields.
    // Here, we define Person directly with its own ID and common fields.
    const Person = sequelize.define('Person', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(30), // String type with max length 30
            allowNull: false,          // `firstName` cannot be null
            field: 'first_name',       // Maps to `first_name` column in database
            validate: {
                notEmpty: true         // `firstName` cannot be empty
            }
        },
        lastName: {
            type: DataTypes.STRING(30), // String type with max length 30
            allowNull: false,           // `lastName` cannot be null
            field: 'last_name',         // Maps to `last_name` column in database
            validate: {
                notEmpty: true          // `lastName` cannot be empty
            }
        }
    }, {
        // Model options
        tableName: 'persons', // Explicit table name
        timestamps: false,    // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    // Add BaseEntity's isNew method for consistency
    Person.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return Person;
};
