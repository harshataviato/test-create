/**
 * @file src/config/cache.js
 * @description Configures an in-memory cache for the application, specifically for vet data.
 * This replaces `CacheConfiguration.java` from the original Spring application.
 * It uses `node-cache` for simple in-memory caching.
 */

const NodeCache = require('node-cache');

/**
 * @module cache
 * @description Provides a simple in-memory caching mechanism.
 */

// Initialize a new NodeCache instance.
// stdTTL: (standard Time To Live) The default expiration time for keys in seconds.
// checkperiod: (check period) The interval in seconds to check for expired keys.
// useClones: If true, all values are cloned upon storage and retrieval, preventing external modifications.
const appCache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

/**
 * @function get
 * @description Retrieves a value from the cache by its key.
 * @param {string} key - The key of the item to retrieve.
 * @returns {*} The cached value, or `undefined` if the key is not found or expired.
 */
function get(key) {
  return appCache.get(key);
}

/**
 * @function set
 * @description Stores a key-value pair in the cache.
 * @param {string} key - The key to store the value under.
 * @param {*} value - The value to store.
 * @param {number} [ttl] - Optional: Time To Live for this specific key in seconds. Overrides global `stdTTL`.
 * @returns {boolean} True if the value was successfully set, false otherwise.
 */
function set(key, value, ttl) {
  if (ttl) {
    return appCache.set(key, value, ttl);
  }
  return appCache.set(key, value);
}

/**
 * @function del
 * @description Deletes an item from the cache by its key.
 * @param {string|string[]} keys - The key or an array of keys to delete.
 * @returns {number} The number of deleted keys.
 */
function del(keys) {
  return appCache.del(keys);
}

/**
 * @function flush
 * @description Clears all items from the cache.
 */
function flush() {
  appCache.flushAll();
}

/**
 * @constant VETS_CACHE_KEY
 * @description A specific key for storing vet-related data in the cache.
 */
const VETS_CACHE_KEY = 'vets';

module.exports = {
  get,
  set,
  del,
  flush,
  VETS_CACHE_KEY
};
