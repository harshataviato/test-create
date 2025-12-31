/**
 * @module utils/cache
 * @description A simple in-memory caching utility using `node-cache`.
 * Useful for frequently accessed but infrequently changing data like vet listings.
 */

const NodeCache = require('node-cache');

// Initialize a new NodeCache instance
// stdTTL: (standard TTL) - The number of seconds to keep an item in cache. Default 0 (forever)
// checkperiod: (check period) - The number of seconds to check for expired keys. Default 600 (10 minutes)
const appCache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600, // Default 1 hour (3600 seconds)
  checkperiod: 120 // Check every 2 minutes
});

/**
 * @function get
 * @description Retrieves a value from the cache.
 * @param {string} key - The key associated with the cached item.
 * @returns {*} The cached value, or `undefined` if not found or expired.
 */
const get = (key) => {
  return appCache.get(key);
};

/**
 * @function set
 * @description Stores a value in the cache.
 * @param {string} key - The key to associate with the value.
 * @param {*} value - The value to cache.
 * @param {number} [ttl] - Optional: Time-to-live in seconds for this specific item. Overrides default.
 * @returns {boolean} True if the value was successfully set, false otherwise.
 */
const set = (key, value, ttl) => {
  if (ttl) {
    return appCache.set(key, value, ttl);
  }
  return appCache.set(key, value);
};

/**
 * @function del
 * @description Deletes an item (or multiple items) from the cache.
 * @param {string|string[]} keys - The key(s) of the item(s) to delete.
 * @returns {number} The number of deleted keys.
 */
const del = (keys) => {
  return appCache.del(keys);
};

/**
 * @function clear
 * @description Clears the entire cache or specific categories of keys.
 * For a simple app, clearing specific keys is more robust.
 * @param {string} [category] - Optional: A prefix to identify a category of keys to clear (e.g., 'vets').
 */
const clear = (category) => {
  if (category) {
    const keys = appCache.keys().filter(key => key.startsWith(category));
    if (keys.length > 0) {
      appCache.del(keys);
      console.log(`Cleared cache for category: ${category}`);
    }
  } else {
    appCache.flushAll(); // Clears all items from the cache
    console.log('Cache flushed completely.');
  }
};

module.exports = {
  get,
  set,
  del,
  clear
};
