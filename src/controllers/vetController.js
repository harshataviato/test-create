/**
 * Veterinarian Controller.
 * 
 * Features:
 * - Application Caching: Checks cache before DB query.
 * - Content Negotiation: Returns JSON or HTML.
 * - Pagination: Supports page/limit params.
 */

const { Vet, Specialty } = require('../models');
const cache = require('../utils/cache');

const CACHE_KEY_VETS = 'vets_list';

exports.getVets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Check Cache
    let vets = cache.get(CACHE_KEY_VETS);

    if (vets) {
      console.log('[Cache] Hit for Veterinarians');
    } else {
      console.log('[Cache] Miss for Veterinarians - Fetching from DB');
      // 2. Fetch from DB if not in cache
      // Note: We fetch all for cache simplicity in this demo, 
      // but strictly pagination should be cached per page key. 
      // Here we fetch all to cache, then slice for view.
      vets = await Vet.findAll({
        include: Specialty
      });
      
      // Store in cache
      cache.set(CACHE_KEY_VETS, vets);
    }

    // Apply pagination to the (potentially cached) dataset
    const paginatedVets = vets.slice(offset, offset + limit);

    // 3. Content Negotiation (JSON vs HTML)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        data: paginatedVets,
        meta: { page, limit, total: vets.length }
      });
    }

    res.render('vets/index', { 
      vets: paginatedVets, 
      currentPage: page, 
      totalPages: Math.ceil(vets.length / limit) 
    });

  } catch (error) {
    next(error);
  }
};
