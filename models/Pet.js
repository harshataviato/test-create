/**
 * @fileoverview Sequelize model definition for Pet.
 * This model extends `NamedEntity` and includes properties for birth date, pet type,
 * and visits. It mimics the `Pet.java` class.
 */

const { DataTypes } = require('sequelize');
const NamedEntityModel = require('./NamedEntity'); // Import the NamedEntity definition

/**
 * @class Pet
 * @extends NamedEntity
 * @description Simple business object representing a pet.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize data types.
 * @returns {Model} The Pet Sequelize model.
 */
module.exports = (sequelize, DataTypes) => {
  const NamedEntity = NamedEntityModel(sequelize, DataTypes); // Initialize NamedEntity for extension

  class Pet extends NamedEntity {
    /**
     * @method addVisit
     * @description Adds a visit to the pet's list of visits.
     * @param {Visit} visit - The visit to add.
     */
    addVisit(visit) {
      if (!this.visits) {
        this.visits = [];
      }
      this.visits.push(visit);
    }
  }

  Pet.init(
    {
      // Inherits 'id', 'name' from NamedEntity
      birthDate: {
        type: DataTypes.DATEONLY, // DATEONLY for 'yyyy-MM-dd' format
        allowNull: true, // Can be null based on PetValidator allowing required check
        field: 'birth_date'
      },
      // type_id will be handled by associations
      // owner_id will be handled by associations
    },
    {
      sequelize,
      modelName: 'Pet',
      tableName: 'pets', // Explicit table name
      timestamps: false, // Disable createdAt and updatedAt
      getterMethods: {
        ...NamedEntity.prototype.getterMethods, // Inherit isNew and toString from NamedEntity
        /**
         * @method getVisits
         * @description Returns the collection of visits, ensuring it's never null.
         * Used to match Java's `getVisits()` behavior that initializes the collection.
         * @returns {Array<Visit>} A collection of visits.
         */
        getVisits() {
          if (!this.visits) {
            this.visits = [];
          }
          return this.visits;
        }
      },
      setterMethods: {
        /**
         * @method setType
         * @description Sets the pet type. This is a custom setter to match Java's model directly,
         * as Sequelize typically handles `type_id` directly or through associated setters like `setPetType`.
         * @param {PetType} type - The PetType object.
         */
        setType(type) {
          this.type = type;
          this.type_id = type ? type.id : null; // Ensure type_id is also set
        },
        /**
         * @method setOwner
         * @description Sets the owner. This is a custom setter to match Java's model directly.
         * @param {Owner} owner - The Owner object.
         */
        setOwner(owner) {
          this.owner = owner;
          this.owner_id = owner ? owner.id : null; // Ensure owner_id is also set
        }
      }
    }
  );

  return Pet;
};
