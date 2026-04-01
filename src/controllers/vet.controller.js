/**
 * @file src/controllers/vet.controller.js
 * @description Handles HTTP requests related to veterinarians.
 * This file replaces `VetController.java`.
 */

const vetService = require('../services/vet.service');

/**
 * @async @function showVetListHtml
 * @description Renders the list of veterinarians in HTML format, with pagination.
 * Mimics `@GetMapping("/vets.html")`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function showVetListHtml(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = 5; // Fixed page size as in the original Java code

  try {
    const { totalItems, totalPages, currentPage, vets } = await vetService.findAllVetsPaginated(page, pageSize);

    res.render('vets/vetList', {
      listVets: vets,
      currentPage: currentPage,
      totalPages: totalPages,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error('Error fetching vet list for HTML view:', error);
    next(error); // Pass any errors to the error handling middleware
  }
}

/**
 * @async @function showResourcesVetListJson
 * @description Returns the list of veterinarians in JSON format.
 * Mimics `@GetMapping("/vets")` with `@ResponseBody`.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function showResourcesVetListJson(req, res, next) {
  try {
    const vets = await vetService.findAllVets(); // This uses cached data if available
    // The original Java returns a 'Vets' object with a 'vetList' property.
    // We'll mimic this structure for consistency if external systems rely on it.
    res.json({ vetList: vets });
  } catch (error) {
    console.error('Error fetching vet list for JSON API:', error);
    next(error); // Pass any errors to the error handling middleware
  }
}

module.exports = {
  showVetListHtml,
  showResourcesVetListJson,
};
