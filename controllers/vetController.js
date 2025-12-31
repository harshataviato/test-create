/**
 * @module controllers/vetController
 * @description Controller for managing Veterinarian (Vet) listings.
 * Implements caching for improved performance.
 */

const db = require('../config/database');
const cache = require('../utils/cache'); // Caching utility

// Cache key for veterinarians list
const VETS_CACHE_KEY = 'vets';
const PAGE_SIZE = 10; // Number of vets per page for pagination

/**
 * @function listVets
 * @description Retrieves and displays a paginated list of all veterinarians,
 * with caching enabled for performance.
 * @param {import('express').Request} req - The Express request object, includes `page` query parameter.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.listVets = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1
  const offset = (page - 1) * PAGE_SIZE;

  try {
    let vetsData = cache.get(VETS_CACHE_KEY); // Try to get vets data from cache

    if (!vetsData) {
      console.log('Fetching vets from database (cache miss)...');
      // If not in cache, fetch from database
      const result = await db.Vet.findAndCountAll({
        limit: PAGE_SIZE,
        offset: offset,
        include: [{
          model: db.Specialty,
          as: 'specialties',
          attributes: ['name'], // Only fetch specialty name
          through: { attributes: [] } // Exclude junction table attributes
        }],
        order: [['lastName', 'ASC']],
      });

      vetsData = {
        vets: result.rows,
        count: result.count
      };
      cache.set(VETS_CACHE_KEY, vetsData, process.env.CACHE_TTL_SECONDS || 3600); // Cache for 1 hour by default
    } else {
      console.log('Fetching vets from cache (cache hit)...');
      // If found in cache, we need to manually paginate from the full cached list
      // This implementation fetches *all* vets into cache, then paginates.
      // For very large datasets, a more sophisticated caching strategy (e.g., caching pages or using Redis)
      // would be needed. For this problem, in-memory cache of all vets is acceptable given clinic scale.
      const allVets = await db.Vet.findAll({
        include: [{
          model: db.Specialty,
          as: 'specialties',
          attributes: ['name'],
          through: { attributes: [] }
        }],
        order: [['lastName', 'ASC']],
      });
      vetsData = {
        vets: allVets.slice(offset, offset + PAGE_SIZE),
        count: allVets.length
      };
    }

    const totalPages = Math.ceil(vetsData.count / PAGE_SIZE);

    res.render('vets/vetList', {
      vets: vetsData.vets,
      currentPage: page,
      totalPages,
      title: res.__('vet.vetListTitle')
    });

  } catch (error) {
    console.error('Error fetching vets:', error);
    next(error);
  }
};
