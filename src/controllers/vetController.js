/**
 * @file controllers/vetController.js
 * @description Controller for managing veterinarian-related operations.
 * Handles HTTP requests for displaying lists of veterinarians in HTML and JSON formats.
 * Mimics Spring PetClinic's `VetController.java`.
 */

const vetService = require('../services/vetService');

/**
 * @function showVetListHtml
 * @description Displays a paginated list of veterinarians in HTML format.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.showVetListHtml = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5; // Matching Spring PetClinic's default page size

  try {
    const { vets, totalItems, totalPages } = await vetService.findPaginatedVets(page, pageSize);

    // Make data available to the EJS template
    res.render('vets/vetList', {
      listVets: vets,
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      title: req.__('vets')
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

/**
 * @function showResourcesVetList
 * @description Returns a list of all veterinarians in JSON format.
 * This acts as an API endpoint.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.showResourcesVetList = async (req, res, next) => {
  try {
    const vets = await vetService.findAllVets();
    // Return a JSON object with a 'vetList' property, mimicking Spring's Vets wrapper object
    res.json({ vetList: vets });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};
