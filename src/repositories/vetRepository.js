/**
 * @file VetRepository module.
 * @description Provides data access methods for `Vet` entities, mimicking Spring Data JPA repositories.
 * It fetches vet data from the PostgreSQL database, including specialties.
 * Implements a simple in-memory cache for vets.
 * @author Google Senior Engineer
 */

const { query } = require('../db/pool');
const { Vet, Vets } = require('../models/vet');
const Specialty = require('../models/specialty');
const NodeCache = require('node-cache'); // Using a simple Node.js cache library

// Initialize a NodeCache instance with a TTL of 1 hour (3600 seconds)
const vetCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // Cache vets for 1 hour

/**
 * Reconstructs `Vet` objects from flat database query results.
 * Handles the many-to-many relationship with `Specialty`.
 * @param {Array<Object>} rows - Array of database rows.
 * @returns {Array<Vet>} An array of fully constructed `Vet` objects.
 */
function mapRowsToVets(rows) {
  const vetsMap = new Map();

  rows.forEach(row => {
    // If vet not yet in map, create new Vet instance
    if (!vetsMap.has(row.vet_id)) {
      vetsMap.set(row.vet_id, new Vet({
        id: row.vet_id,
        firstName: row.vet_first_name,
        lastName: row.vet_last_name,
        specialties: []
      }));
    }
    const vet = vetsMap.get(row.vet_id);

    // If specialty exists for this row and not yet added to vet's specialties
    if (row.specialty_id && !Array.from(vet.getSpecialties()).some(s => s.id === row.specialty_id)) { // Check against getSpecialties() for existing
      vet.addSpecialty(new Specialty(row.specialty_id, row.specialty_name));
    }
  });

  return Array.from(vetsMap.values());
}


/**
 * Retrieves all `Vet`s from the data store.
 * Implements caching (similar to `@Cacheable("vets")` in Java).
 * @returns {Promise<Array<Vet>>} A promise that resolves to a collection of `Vet` objects.
 */
async function findAll() {
  const cachedVets = vetCache.get('allVets');
  if (cachedVets) {
    // console.log('Serving vets from cache');
    return cachedVets;
  }

  const res = await query(`
    SELECT
      v.id AS vet_id, v.first_name AS vet_first_name, v.last_name AS vet_last_name,
      s.id AS specialty_id, s.name AS specialty_name
    FROM vets v
    LEFT JOIN vet_specialties vs ON v.id = vs.vet_id
    LEFT JOIN specialties s ON vs.specialty_id = s.id
    ORDER BY v.last_name, v.first_name, s.name;
  `);

  const vets = mapRowsToVets(res.rows);
  vetCache.set('allVets', vets); // Cache the result
  return vets;
}

/**
 * Retrieves `Vet`s from the data store in pages.
 * Implements caching (similar to `@Cacheable("vets")` in Java).
 * The cache key includes pagination parameters.
 * @param {number} page - The current page number (1-indexed).
 * @param {number} pageSize - The number of vets per page.
 * @returns {Promise<object>} A promise that resolves to an object containing paginated vet data.
 *   { totalItems: number, listVets: Array<Vet>, totalPages: number, currentPage: number }
 */
async function findAllPaginated(page, pageSize) {
  const cacheKey = `vetsPage_${page}_${pageSize}`;
  const cachedResult = vetCache.get(cacheKey);
  if (cachedResult) {
    // console.log(`Serving vets for page ${page} from cache`);
    return cachedResult;
  }

  const offset = (page - 1) * pageSize;

  // First, get the total count of vets for pagination metadata
  const countRes = await query('SELECT COUNT(*) AS total_count FROM vets;');
  const totalItems = parseInt(countRes.rows[0].total_count, 10);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Then, fetch the vet IDs for the current page
  const vetIdsOnPageRes = await query(`
    SELECT id
    FROM vets
    ORDER BY last_name, first_name
    LIMIT $1 OFFSET $2;
  `, [pageSize, offset]);

  const vetIdsOnPage = vetIdsOnPageRes.rows.map(row => row.id);

  if (vetIdsOnPage.length === 0) {
    const result = {
      totalItems,
      listVets: [],
      totalPages,
      currentPage: page
    };
    vetCache.set(cacheKey, result);
    return result;
  }

  // Fetch all details for vets on the current page, including their specialties
  const vetsWithDetailsRes = await query(`
    SELECT
      v.id AS vet_id, v.first_name AS vet_first_name, v.last_name AS vet_last_name,
      s.id AS specialty_id, s.name AS specialty_name
    FROM vets v
    LEFT JOIN vet_specialties vs ON v.id = vs.vet_id
    LEFT JOIN specialties s ON vs.specialty_id = s.id
    WHERE v.id = ANY($1::int[])
    ORDER BY v.last_name, v.first_name, s.name;
  `, [vetIdsOnPage]);

  const vets = mapRowsToVets(vetsWithDetailsRes.rows);

  const result = {
    totalItems,
    listVets: vets,
    totalPages,
    currentPage: page
  };

  vetCache.set(cacheKey, result); // Cache the paginated result
  return result;
}

module.exports = {
  findAll,
  findAllPaginated,
  vetCache // Export cache for testing purposes (clearing it)
};

