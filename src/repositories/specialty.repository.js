/**
 * @file src/repositories/specialty.repository.js
 * @description Provides data access methods for the Specialty model.
 * This replaces `SpecialtyRepository.java` (if it existed) by interacting directly with the Sequelize model.
 */

const Specialty = require('../models/specialty.model');

/**
 * @module specialtyRepository
 * @description Repository for managing `Specialty` entities.
 */
const specialtyRepository = {

  /**
   * @async @function findAll
   * @description Retrieves all specialties from the data store, ordered by name.
   * @returns {Promise<Array<Specialty>>} A promise that resolves to an array of Specialty objects.
   */
  async findAll() {
    return Specialty.findAll({
      order: [['name', 'ASC']] // Order by name ascending
    });
  },

  /**
   * @async @function findById
   * @description Retrieves a single specialty by its ID.
   * @param {number} id - The ID of the specialty to retrieve.
   * @returns {Promise<Specialty|null>} A promise that resolves to the Specialty object if found, otherwise null.
   */
  async findById(id) {
    return Specialty.findByPk(id);
  },

  /**
   * @async @function create
   * @description Creates a new specialty in the data store.
   * @param {object} specialtyData - The data for the new specialty.
   * @returns {Promise<Specialty>} A promise that resolves to the newly created Specialty object.
   */
  async create(specialtyData) {
    return Specialty.create(specialtyData);
  },

  /**
   * @async @function update
   * @description Updates an existing specialty in the data store.
   * @param {number} id - The ID of the specialty to update.
   * @param {object} specialtyData - The new data for the specialty.
   * @returns {Promise<[number, Specialty[]]>} A promise that resolves to an array
   *   containing the number of affected rows and the updated instances.
   */
  async update(id, specialtyData) {
    return Specialty.update(specialtyData, {
      where: { id },
      returning: true, // Return the updated instance(s)
    });
  },

  /**
   * @async @function delete
   * @description Deletes a specialty from the data store by its ID.
   * @param {number} id - The ID of the specialty to delete.
   * @returns {Promise<number>} A promise that resolves to the number of deleted rows (1 if successful, 0 otherwise).
   */
  async delete(id) {
    return Specialty.destroy({
      where: { id }
    });
  }
};

module.exports = specialtyRepository;
