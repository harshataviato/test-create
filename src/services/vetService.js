/**
 * @file services/vetService.js
 * @description Service layer for Vet-related business logic.
 * Interacts with the Vet and Specialty models for data access.
 * Mimics the functionality of Spring PetClinic's `VetRepository`.
 */

const sequelize = require('../config/database');
const { Vet, Specialty } = require('../config/database').models;

/**
 * @function findAllVets
 * @description Retrieves all veterinarians from the data store, including their specialties.
 * @returns {Promise<Vet[]>} A promise that resolves to a collection of Vet objects.
 */
exports.findAllVets = async () => {
  return await Vet.findAll({
    include: [{ model: Specialty, as: 'specialties' }],
    order: [
      ['lastName', 'ASC'],
      [{ model: Specialty, as: 'specialties' }, 'name', 'ASC'] // Order specialties within each vet
    ]
  });
};

/**
 * @function findPaginatedVets
 * @description Retrieves veterinarians from the data store with pagination, including their specialties.
 * @param {number} page - The current page number (1-indexed).
 * @param {number} pageSize - The number of vets per page.
 * @returns {Promise<{vets: Vet[], totalItems: number, totalPages: number}>} A promise that resolves to an object
 * containing the list of vets, total count, and total pages.
 */
exports.findPaginatedVets = async (page, pageSize) => {
  const offset = (page - 1) * pageSize;

  const { count, rows } = await Vet.findAndCountAll({
    limit: pageSize,
    offset: offset,
    order: [['lastName', 'ASC']],
    include: [{ model: Specialty, as: 'specialties' }]
  });

  const totalPages = Math.ceil(count / pageSize);

  return { vets: rows, totalItems: count, totalPages: totalPages };
};
