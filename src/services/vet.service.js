/**
 * @file src/services/vet.service.js
 * @description Business logic layer for Vet related operations, including caching.
 * This replaces `ClinicService` for vet operations and `CacheConfiguration.java` for caching.
 */

const vetRepository = require('../repositories/vet.repository');
const cache = require('../config/cache');

/**
 * @module vetService
 * @description Service layer for Vet operations with caching.
 */
const vetService = {

  /**
   * @async @function findAllVets
   * @description Retrieves all vets, utilizing an in-memory cache.
   * If vets are in cache, returns them. Otherwise, fetches from DB, stores in cache, and returns.
   * Mimics `@Cacheable("vets")` annotation from Spring.
   * @returns {Promise<Array<Vet>>} A promise that resolves to an array of Vet objects.
   */
  async findAllVets() {
    const cachedVets = cache.get(cache.VETS_CACHE_KEY);
    if (cachedVets) {
      console.log('Retrieving vets from cache.');
      return cachedVets;
    }

    console.log('Retrieving vets from database and caching.');
    const vets = await vetRepository.findAll();
    cache.set(cache.VETS_CACHE_KEY, vets); // Cache for default TTL
    return vets;
  },

  /**
   * @async @function findAllVetsPaginated
   * @description Retrieves vets from the database in pages.
   * Caching is not applied to paginated results as it's less efficient for varied queries.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{totalItems: number, totalPages: number, currentPage: number, vets: Array<Vet>}>}
   *   An object containing paginated vet data.
   */
  async findAllVetsPaginated(page, pageSize) {
    return vetRepository.findAllPaginated(page, pageSize);
  },

  /**
   * @async @function getVetById
   * @description Retrieves a single vet by its ID.
   * @param {number} vetId - The ID of the vet to retrieve.
   * @returns {Promise<Vet|null>} A promise that resolves to the Vet object if found, otherwise null.
   */
  async getVetById(vetId) {
    return vetRepository.findById(vetId);
  },

  // No specific create/update/delete methods for vets are exposed through the UI in original PetClinic,
  // so they are not implemented here in the service layer either.
  // If needed, they would delegate to `vetRepository`.
};

module.exports = vetService;
