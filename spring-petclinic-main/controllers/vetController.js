/**
 * @file vetController.js
 * @description Handles HTTP requests related to Veterinarians.
 * This file replaces the functionality of VetController.java.
 * It manages listing veterinarians and returning them as JSON or HTML.
 * @author Google Senior Engineer
 */

const { Vet, Specialty } = require('../models');
const NodeCache = require('node-cache'); // Simple in-memory cache
const i18n = require('../utils/i18n'); // i18n instance

// Initialize cache for vets with a TTL of 60 seconds (similar to JCache example)
const vetCache = new NodeCache({ stdTTL: 60, checkperiod: 10 });
const VETS_CACHE_KEY = 'vets';

// Number of vets to display per page in the vets list
const PAGE_SIZE = 5;

/**
 * @function getVetsFromCacheOrDB
 * @description Retrieves veterinarians from cache or database. If not in cache,
 * fetches from DB, stores in cache, and returns.
 * @returns {Promise<Array<Vet>>} A promise that resolves to an array of Vet objects.
 */
async function getVetsFromCacheOrDB() {
  let vets = vetCache.get(VETS_CACHE_KEY);
  if (vets) {
    console.log('Serving vets from cache.');
    return vets;
  }

  console.log('Fetching vets from database...');
  vets = await Vet.findAll({
    include: [{ model: Specialty, as: 'specialties' }],
    order: [['lastName', 'ASC']]
  });
  vetCache.set(VETS_CACHE_KEY, vets);
  return vets;
}

/**
 * @function showVetListHtml
 * @description Renders the HTML page listing all veterinarians with pagination.
 * Corresponds to `/vets.html` in the original application.
 * @param {object} req - Express request object, expecting 'page' query parameter.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Renders the 'vets/vetList' view.
 */
exports.showVetListHtml = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const { count, rows: vetsList } = await Vet.findAndCountAll({
      include: [{ model: Specialty, as: 'specialties' }],
      limit: PAGE_SIZE,
      offset: offset,
      order: [['lastName', 'ASC']]
    });

    res.render('vets/vetList', {
      listVets: vetsList,
      currentPage: page,
      totalPages: Math.ceil(count / PAGE_SIZE),
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching vet list (HTML):', error);
    next(error);
  }
};

/**
 * @function showResourcesVetList
 * @description Returns a JSON representation of all veterinarians.
 * Corresponds to `/vets` in the original application (JSON endpoint).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Sends a JSON response.
 */
exports.showResourcesVetList = async (req, res, next) => {
  try {
    const vets = await getVetsFromCacheOrDB(); // Utilize caching
    res.json({ vetList: vets }); // Wrap in `vetList` as per Java `Vets` object structure
  } catch (error) {
    console.error('Error fetching vet list (JSON):', error);
    next(error);
  }
};
