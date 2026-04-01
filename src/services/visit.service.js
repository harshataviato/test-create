/**
 * @file src/services/visit.service.js
 * @description Business logic layer for Visit related operations.
 * This acts as an intermediary between controllers and repositories.
 */

const visitRepository = require('../repositories/visit.repository');
const Visit = require('../models/visit.model');

/**
 * @module visitService
 * @description Service layer for Visit operations.
 */
const visitService = {

  /**
   * @async @function createVisit
   * @description Creates a new visit for a given pet.
   * @param {number} petId - The ID of the pet associated with the visit.
   * @param {object} visitData - Data for the new visit (date, description).
   * @returns {Promise<Visit>} The newly created visit object.
   */
  async createVisit(petId, visitData) {
    const newVisit = Visit.build({ ...visitData, pet_id: petId });
    return visitRepository.create(newVisit.dataValues);
  },

  /**
   * @async @function getVisitsByPetId
   * @description Retrieves all visits for a specific pet.
   * @param {number} petId - The ID of the pet.
   * @returns {Promise<Array<Visit>>} An array of visit objects.
   */
  async getVisitsByPetId(petId) {
    return visitRepository.findAllByPetId(petId);
  },

  /**
   * @async @function getVisitById
   * @description Retrieves a single visit by its ID.
   * @param {number} visitId - The ID of the visit.
   * @returns {Promise<Visit|null>} The visit object or null if not found.
   */
  async getVisitById(visitId) {
    return visitRepository.findById(visitId);
  },

  /**
   * @async @function updateVisit
   * @description Updates an existing visit.
   * @param {number} visitId - The ID of the visit to update.
   * @param {object} visitData - The updated data for the visit.
   * @returns {Promise<Visit>} The updated visit object.
   * @throws {Error} If visit is not found.
   */
  async updateVisit(visitId, visitData) {
    const [affectedRows, updatedVisits] = await visitRepository.update(visitId, visitData);
    if (affectedRows === 0) {
      throw new Error(`Visit not found with id: ${visitId}`);
    }
    return updatedVisits[0]; // Sequelize update returns an array of updated instances
  },

  /**
   * @async @function deleteVisit
   * @description Deletes a visit by ID.
   * @param {number} visitId - The ID of the visit to delete.
   * @returns {Promise<number>} The number of affected rows (1 if deleted, 0 if not found).
   */
  async deleteVisit(visitId) {
    return visitRepository.delete(visitId);
  }
};

module.exports = visitService;
