/**
 * @fileoverview Vet model, extending Person with specialties association.
 * This file defines the `Vet` model, including its association with `Specialty` models.
 * It mimics `Vet.java`.
 */

const Person = require('./person'); // Import the Person model
const Specialty = require('./specialty'); // Import the Specialty model (needed for type hinting in associate)

/**
 * Defines the Vet model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Vet model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Vet model, inheriting `id`, `firstName`, `lastName` conceptually from Person.
    // In Sequelize, this means defining a new model with its own `id` as PK,
    // and including `firstName` and `lastName` as regular attributes.
    const Vet = sequelize.define('Vet', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(30),
            allowNull: false,
            field: 'first_name',
            validate: { notEmpty: true }
        },
        lastName: {
            type: DataTypes.STRING(30),
            allowNull: false,
            field: 'last_name',
            validate: { notEmpty: true }
        }
    }, {
        // Model options
        tableName: 'vets', // Explicit table name
        timestamps: false, // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the Vet model.
     * Vet belongs to many Specialties (many-to-many relationship).
     * @param {object} models - Object containing all defined Sequelize models.
     */
    Vet.associate = (models) => {
        Vet.belongsToMany(models.Specialty, {
            through: 'vet_specialties', // Name of the join table
            foreignKey: 'vetId',        // Foreign key in `vet_specialties` that refers to `Vet`
            otherKey: 'specialtyId',    // Foreign key in `vet_specialties` that refers to `Specialty`
            as: 'specialties'           // Alias for the association
        });
    };

    /**
     * Checks if the vet entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    Vet.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    /**
     * Gets the number of specialties for this vet.
     * @returns {number} The count of specialties.
     */
    Vet.prototype.getNrOfSpecialties = function() {
        return this.specialties ? this.specialties.length : 0;
    };

    /**
     * Adds a specialty to the vet's collection.
     * @param {object} specialty - The Specialty object to add.
     */
    Vet.prototype.addSpecialty = function(specialty) {
        if (!this.specialties) {
            this.specialties = []; // Initialize if null
        }
        // Ensure specialty is not already added (by ID or name, depending on context)
        if (!this.specialties.some(s => s.id === specialty.id)) {
            this.specialties.push(specialty);
        }
    };

    return Vet;
};
