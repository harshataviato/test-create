/**
 * @fileoverview Specialty model, representing a veterinarian's specialty.
 * This file defines the `Specialty` model, which includes a `name` field
 * and inherits the `id` from `BaseEntity`. It mimics `Specialty.java`.
 */

const NamedEntity = require('./namedEntity'); // Import the NamedEntity model

/**
 * Defines the Specialty model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Specialty model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Specialty model, conceptually extending NamedEntity.
    // In Sequelize, this means defining a new model with its own `id` as PK,
    // and including `name` as a regular attribute.
    const Specialty = sequelize.define('Specialty', {
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
            unique: true // Specialty names should be unique
        }
    }, {
        // Model options
        tableName: 'specialties', // Explicit table name
        timestamps: false,       // Disable createdAt and updatedAt fields
        freezeTableName: true    // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the Specialty model.
     * Specialty belongs to many Vets (many-to-many relationship).
     * @param {object} models - Object containing all defined Sequelize models.
     */
    Specialty.associate = (models) => {
        Specialty.belongsToMany(models.Vet, {
            through: 'vet_specialties', // Name of the join table
            foreignKey: 'specialtyId',  // Foreign key in `vet_specialties` that refers to `Specialty`
            otherKey: 'vetId',          // Foreign key in `vet_specialties` that refers to `Vet`
            as: 'vets'                  // Alias for the association
        });
    };

    /**
     * Checks if the specialty entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    Specialty.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    return Specialty;
};
