/**
 * @file src/repositories/pet-type.repository.js
 * @description Provides data access methods for the PetType model.
 * This replaces `PetTypeRepository.java` from the original Spring application.
 */

const PetType = require('../models/pet-type.model');

/**
 * @module petTypeRepository
 * @description Repository for managing `PetType` entities.
 */
const petTypeRepository = {

  /**
   * @async @function findPetTypes
   * @description Retrieves all pet types from the data store, ordered by name.
   * Mimics `findPetTypes()` method in Java.
   * @returns {Promise<Array<PetType>>} A promise that resolves to an array of PetType objects.
   */
  async findPetTypes() {
    return PetType.findAll({
      order: [['name', 'ASC']] // Order by name ascending
    });
  },

  /**
   * @async @function findById
   * @description Retrieves a single pet type by its ID.
   * @param {number} id - The ID of the pet type to retrieve.
   * @returns {Promise<PetType|null>} A promise that resolves to the PetType object if found, otherwise null.
   */
  async findById(id) {
    return PetType.findByPk(id);
  },

  /**
   * @async @function create
   * @description Creates a new pet type in the data store.
   * @param {object} petTypeData - The data for the new pet type.
   * @returns {Promise<PetType>} A promise that resolves to the newly created PetType object.
   */
  async create(petTypeData) {
    return PetType.create(petTypeData);
  },

  /**
   * @async @function update
   * @description Updates an existing pet type in the data store.
   * @param {number} id - The ID of the pet type to update.
   * @param {object} petTypeData - The new data for the pet type.
   * @returns {Promise<[number, PetType[]]>} A promise that resolves to an array
   *   containing the number of affected rows and the updated instances.
   */
  async update(id, petTypeData) {
    return PetType.update(petTypeData, {
      where: { id },
      returning: true, // Return the updated instance(s)
    });
  },

  /**
   * @async @function delete
   * @description Deletes a pet type from the data store by its ID.
   * @param {number} id - The ID of the pet type to delete.
   * @returns {Promise<number>} A promise that resolves to the number of deleted rows (1 if successful, 0 otherwise).
   */
  async delete(id) {
    return PetType.destroy({
      where: { id }
    });
  }
};

module.exports = petTypeRepository;
