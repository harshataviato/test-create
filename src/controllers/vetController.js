/**
 * @file VetController module.
 * @description Handles requests related to `Vet` entities, primarily displaying lists of veterinarians.
 * Mirrors Spring's `VetController.java`.
 * @author Google Senior Engineer
 */

const vetRepository = require('../repositories/vetRepository');
const { Vets } = require('../models/vet'); // Import Vets container model
const config = require('../config');

/**
 * Displays a paginated list of veterinarians in HTML format.
 * Corresponds to `showVetList()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function showVetListHtml(req, res, next) {
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = config.pagination.pageSize; // Number of items per page from config

  try {
    const paginatedResult = await vetRepository.findAllPaginated(page, pageSize);
    const { totalItems, listVets, totalPages, currentPage } = paginatedResult;

    res.render('vets/vetList', {
      listVets,
      currentPage,
      totalPages,
      totalItems,
      menu: 'vets' // Set 'vets' as the active menu item for the layout
    });
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

/**
 * Returns a list of veterinarians as JSON.
 * Corresponds to `showResourcesVetList()` in Java.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function showResourcesVetList(req, res, next) {
  try {
    const vets = await vetRepository.findAll();
    const vetsWrapper = new Vets(vets); // Wrap the list in a Vets object as per Java model
    res.json(vetsWrapper); // Send JSON response
  } catch (error) {
    next(error); // Pass database errors to the error handler
  }
}

module.exports = {
  showVetListHtml,
  showResourcesVetList
};
