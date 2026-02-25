/**
 * @fileoverview Pet model, extending NamedEntity with birth date and type/visits associations.
 * This file defines the `Pet` model, including birth date, and sets up its associations
 * with `PetType` and `Visit` models. It mimics `Pet.java`.
 */

const NamedEntity = require('./namedEntity'); // Import the NamedEntity model

/**
 * Defines the Pet model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Pet model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Pet model, inheriting `id` and `name` conceptually from NamedEntity.
    // In Sequelize, this means defining a new model with its own `id` as PK,
    // and including `name` as a regular attribute.
    const Pet = sequelize.define('Pet', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: { notEmpty: true }
        },
        birthDate: {
            type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format without time
            allowNull: false,
            field: 'birth_date'      // Maps to `birth_date` column in database
        },
        // Foreign key for PetType association
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'type_id'
        },
        // Foreign key for Owner association
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'owner_id'
        }
    }, {
        // Model options
        tableName: 'pets', // Explicit table name
        timestamps: false, // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the Pet model.
     * Pet belongs to an Owner and a PetType, and has many Visits.
     * @param {object} models - Object containing all defined Sequelize models.
     */
    Pet.associate = (models) => {
        Pet.belongsTo(models.Owner, { foreignKey: 'ownerId' });
        Pet.belongsTo(models.PetType, { foreignKey: 'typeId', as: 'type' });
        Pet.hasMany(models.Visit, {
            as: 'visits',
            foreignKey: 'petId',
            onDelete: 'CASCADE' // If a pet is deleted, its visits are also deleted
        });
    };

    /**
     * Checks if the pet entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    Pet.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    /**
     * Adds a visit to the pet's collection.
     * @param {object} visit - The Visit object to add.
     */
    Pet.prototype.addVisit = function(visit) {
        if (!this.visits) {
            this.visits = [];
        }
        this.visits.push(visit);
        visit.petId = this.id; // Ensure visit's petId is set
    };

    return Pet;
};
