/**
 * @file src/services/owner.service.js
 * @description Business logic layer for Owner related operations.
 * This acts as an intermediary between controllers and repositories, handling
 * data retrieval, pagination, and potentially complex business rules.
 */

const ownerRepository = require('../repositories/owner.repository');
const Owner = require('../models/owner.model'); // Import the Owner model for instantiation

/**
 * @module ownerService
 * @description Service layer for Owner operations.
 */
const ownerService = {

  /**
   * @async @function findOwnersByLastNamePaginated
   * @description Finds owners by last name with pagination.
   * @param {string} lastName - The last name to search for (can be empty for all owners).
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of owners per page.
   * @returns {Promise<{totalItems: number, totalPages: number, currentPage: number, owners: Array<Owner>}>}
   *   An object containing paginated owner data.
   */
  async findOwnersByLastNamePaginated(lastName, page, pageSize) {
    return ownerRepository.findByLastNameStartingWith(lastName, page, pageSize);
  },

  /**
   * @async @function getOwnerById
   * @description Retrieves an owner by their ID.
   * @param {number} ownerId - The ID of the owner.
   * @returns {Promise<Owner|null>} The owner object or null if not found.
   */
  async getOwnerById(ownerId) {
    if (!ownerId) {
      throw new Error("Owner ID must not be null or undefined.");
    }
    return ownerRepository.findById(ownerId);
  },

  /**
   * @async @function createOwner
   * @description Creates a new owner.
   * @param {object} ownerData - Data for the new owner.
   * @returns {Promise<Owner>} The newly created owner object.
   */
  async createOwner(ownerData) {
    const owner = Owner.build(ownerData); // Use build to create a new instance without saving yet
    return ownerRepository.save(owner);
  },

  /**
   * @async @function updateOwner
   * @description Updates an existing owner.
   * @param {number} ownerId - The ID of the owner to update.
   * @param {object} ownerData - The updated data for the owner.
   * @returns {Promise<Owner>} The updated owner object.
   * @throws {Error} If owner is not found or ID mismatch.
   */
  async updateOwner(ownerId, ownerData) {
    const existingOwner = await ownerRepository.findById(ownerId);
    if (!existingOwner) {
      throw new Error(`Owner not found with id: ${ownerId}`);
    }

    // Update existing properties
    Object.assign(existingOwner, ownerData);
    return ownerRepository.save(existingOwner);
  },

  /**
   * @async @function deleteOwner
   * @description Deletes an owner by ID.
   * @param {number} ownerId - The ID of the owner to delete.
   * @returns {Promise<number>} The number of affected rows (1 if deleted, 0 if not found).
   */
  async deleteOwner(ownerId) {
    return ownerRepository.deleteById(ownerId);
  }
};

module.exports = ownerService;
