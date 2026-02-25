/**
 * @fileoverview Owner model, extending Person with contact details and pets association.
 * This file defines the `Owner` model, including address, city, and telephone fields,
 * and sets up its association with `Pet` models. It mimics `Owner.java`.
 */

const Person = require('./person'); // Import the Person model

/**
 * Defines the Owner model.
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object.
 * @returns {object} The defined Owner model.
 */
module.exports = (sequelize, DataTypes) => {
    // Define the Owner model. In Sequelize, models can extend others by having the same PK strategy
    // or by explicit associations. Here, Owner will have its own table and fields, including inherited-like Person fields.
    const Owner = sequelize.define('Owner', {
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
        },
        address: {
            type: DataTypes.STRING(255), // String type with max length 255
            allowNull: false,
            validate: { notEmpty: true }
        },
        city: {
            type: DataTypes.STRING(80), // String type with max length 80
            allowNull: false,
            validate: { notEmpty: true }
        },
        telephone: {
            type: DataTypes.STRING(20), // String type with max length 20
            allowNull: false,
            validate: {
                notEmpty: true,
                is: /^\d{10}$/ // Regex for a 10-digit number
            }
        }
    }, {
        // Model options
        tableName: 'owners', // Explicit table name
        timestamps: false,   // Disable createdAt and updatedAt fields
        freezeTableName: true // Prevent Sequelize from pluralizing
    });

    /**
     * Defines associations for the Owner model.
     * Owner has many Pets.
     * @param {object} models - Object containing all defined Sequelize models.
     */
    Owner.associate = (models) => {
        Owner.hasMany(models.Pet, {
            as: 'pets',
            foreignKey: 'ownerId',
            onDelete: 'CASCADE' // If an owner is deleted, their pets are also deleted
        });
    };

    /**
     * Checks if the owner entity is new (not yet persisted).
     * @returns {boolean} True if the ID is null or undefined.
     */
    Owner.prototype.isNew = function() {
        return this.id === null || this.id === undefined;
    };

    /**
     * Retrieves a pet by its name for this owner.
     * @param {string} name - The name of the pet to find.
     * @param {boolean} [ignoreNew=false] - Whether to ignore new (unsaved) pets.
     * @returns {object|null} The Pet object if found, otherwise null.
     */
    Owner.prototype.getPet = function(name, ignoreNew = false) {
        if (!this.pets) return null; // Ensure pets array exists
        for (const pet of this.pets) {
            if (pet.name && pet.name.toLowerCase() === name.toLowerCase()) {
                if (!ignoreNew || !pet.isNew()) {
                    return pet;
                }
            }
        }
        return null;
    };

    /**
     * Retrieves a pet by its ID for this owner.
     * @param {number} id - The ID of the pet to find.
     * @returns {object|null} The Pet object if found, otherwise null.
     */
    Owner.prototype.getPetById = function(id) {
        if (!this.pets) return null; // Ensure pets array exists
        for (const pet of this.pets) {
            if (pet.id === id) {
                return pet;
            }
        }
        return null;
    };

    /**
     * Adds a pet to the owner's collection.
     * If the pet is new, it's added to the in-memory `pets` array.
     * For persisted changes, `owner.save()` or `pet.save()` must be called.
     * @param {object} pet - The Pet object to add.
     */
    Owner.prototype.addPet = function(pet) {
        if (!this.pets) {
            this.pets = [];
        }
        if (pet.isNew()) {
            this.pets.push(pet);
        }
        pet.ownerId = this.id; // Ensure pet's ownerId is set
    };

    /**
     * Adds a visit to a specific pet of this owner.
     * @param {number} petId - The ID of the pet to add the visit to.
     * @param {object} visit - The Visit object to add.
     * @throws {Error} If petId or visit is null, or if the pet is not found.
     */
    Owner.prototype.addVisit = function(petId, visit) {
        if (petId === null || petId === undefined) {
            throw new Error('Pet identifier must not be null!');
        }
        if (visit === null || visit === undefined) {
            throw new Error('Visit must not be null!');
        }

        const pet = this.getPetById(petId);

        if (!pet) {
            throw new Error('Invalid Pet identifier!');
        }

        pet.addVisit(visit);
    };

    return Owner;
};
