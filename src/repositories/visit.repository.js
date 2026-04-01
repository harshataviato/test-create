/**
 * @file src/repositories/visit.repository.js
 * @description Provides data access methods for the Visit model.
 * This replaces `VisitRepository.java` (if it existed) by interacting directly with the Sequelize model.
 */

const Visit = require('../models/visit.model');

/**
 * @module visitRepository
 * @description Repository for managing `Visit` entities.
 */
const visitRepository = {

  /**
   * @async @function findById
   * @description Retrieves a single visit by its ID.
   * @param {number} id - The ID of the visit to retrieve.
   * @returns {Promise<Visit|null>} A promise that resolves to the Visit object if found, otherwise null.
   */
  async findById(id) {
    return Visit.findByPk(id);
  },

  /**
   * @async @function findAllByPetId
   * @description Retrieves all visits for a specific pet, ordered by date.
   * @param {number} petId - The ID of the pet.
   * @returns {Promise<Array<Visit>>} A promise that resolves to an array of Visit objects.
   */
  async findAllByPetId(petId) {
    return Visit.findAll({
      where: { pet_id: petId },
      order: [['date', 'ASC']] // Order by date ascending
    });
  },

  /**
   * @async @function create
   * @description Creates a new visit in the data store.
   * @param {object} visitData - The data for the new visit.
   * @returns {Promise<Visit>} A promise that resolves to the newly created Visit object.
   */
  async create(visitData) {
    return Visit.create(visitData);
  },

  /**
   * @async @function update
   * @description Updates an existing visit in the data store.
   * @param {number} id - The ID of the visit to update.
   * @param {object} visitData - The new data for the visit.
   * @returns {Promise<[number, Visit[]]>} A promise that resolves to an array
   *   containing the number of affected rows and the updated instances.
   */
  async update(id, visitData) {
    return Visit.update(visitData, {
      where: { id },
      returning: true, // Return the updated instance(s)
    });
  },

  /**
   * @async @function delete
   * @description Deletes a visit from the data store by its ID.
   * @param {number} id - The ID of the visit to delete.
   * @returns {Promise<number>} A promise that resolves to the number of deleted rows (1 if successful, 0 otherwise).
   */
  async delete(id) {
    return Visit.destroy({
      where: { id }
    });
  }
};

module.exports = visitRepository;
