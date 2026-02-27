const NodeCache = require('node-cache');

/**
 * Performance Optimization via Caching
 * Simulates JCache API behavior.
 * Tracks statistics for JMX-like monitoring.
 */
class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get item from cache
   * @param {string} key 
   * @returns {any}
   */
  get(key) {
    const val = this.cache.get(key);
    if (val) {
      this.hits++;
      return val;
    }
    this.misses++;
    return null;
  }

  /**
   * Set item in cache
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    return this.cache.set(key, value);
  }

  /**
   * Returns cache metrics for the health endpoint
   */
  getStats() {
    return {
      ...this.cache.getStats(),
      customHits: this.hits,
      customMisses: this.misses,
      hitRatio: this.hits / (this.hits + this.misses || 1)
    };
  }
}

module.exports = new CacheService();
