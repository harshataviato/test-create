/**
 * @file src/repositories/vet.repository.js
 * @description Provides data access methods for the Vet model.
 * This replaces `VetRepository.java` from the original Spring application.
 */

const { Op } = require('sequelize');
const Vet = require('../models/vet.model');
const Specialty = require('../models/specialty.model');

/**
 * @module vetRepository
 * @description Repository for managing `Vet` entities.
 */
const vetRepository = {

  /**
   * @async @function findAll
   * @description Retrieves all vets from the data store, including their specialties,
   * sorted by last name, then first name.
   * Mimics `findAll()` and `@Cacheable("vets")` behavior, although caching is handled at a higher service layer.
   * @returns {Promise<Array<Vet>>} A promise that resolves to an array of Vet objects.
   */
  async findAll() {
    return Vet.findAll({
      include: [{ model: Specialty, as: 'specialties' }], // Eager load specialties
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
      ]
    });
  },

  /**
   * @async @function findAllPaginated
   * @description Retrieves vets from the data store in pages, including their specialties.
   * Mimics `findAll(Pageable pageable)`.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{totalItems: number, totalPages: number, currentPage: number, vets: Array<Vet>}>}
   *   A promise that resolves to an object containing pagination details and an array of Vet objects.
   */
  async findAllPaginated(page, pageSize) {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Vet.findAndCountAll({
      include: [{ model: Specialty, as: 'specialties' }],
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
      ],
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(count / pageSize);

    return {
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      vets: rows,
    };
  },

  /**
   * @async @function findById
   * @description Retrieves a single vet by its ID, including their specialties.
   * @param {number} id - The ID of the vet to retrieve.
   * @returns {Promise<Vet|null>} A promise that resolves to the Vet object if found, otherwise null.
   */
  async findById(id) {
    return Vet.findByPk(id, {
      include: [{ model: Specialty, as: 'specialties' }]
    });
  },

  // Additional CRUD operations could be added here if Vets were editable via the UI
  // For now, based on the original Java, Vets are mostly read-only.
};

module.exports = vetRepository;
