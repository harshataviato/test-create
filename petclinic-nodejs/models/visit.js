/**
 * @fileoverview Visit model, representing a pet's visit.
 * This file defines the `Visit` model, including visit date and description.
 * It mimics `Visit.java`.
 */

const BaseEntity = require('./baseEntity'); // Import the BaseEntity model

/**
 * Defines the Visit model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Visit model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Visit model, conceptually extending BaseEntity.
    const Visit = sequelize.define('Visit', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        visitDate: {
            type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format without time
            allowNull: false,
            field: 'visit_date',    // Maps to `visit_date` column in database
            defaultValue: DataTypes.NOW // Default to current date when created
        },
        description: {
            type: DataTypes.STRING(255), // String type with max length 255
            allowNull: false,
            validate: { notEmpty: true }
        },
        // Foreign key for Pet association
        petId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'pet_id'
        }
    }, {
        // Model options
        tableName: 'visits', // Explicit table name
        timestamps: false,   // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the Visit model.
     * A Visit belongs to a Pet.
     * @param {object} models - Object containing all defined Sequelize models.
     */
    Visit.associate = (models) => {
        Visit.belongsTo(models.Pet, { foreignKey: 'petId' });
    };

    /**
     * Checks if the visit entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    Visit.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return Visit;
};
