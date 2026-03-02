/**
 * Application Caching Layer.
 * 
 * Implements a wrapper around node-cache to simulate JCache functionality.
 * Used primarily for storing reference data (Veterinarians) to reduce DB load.
 */

const NodeCache = require('node-cache');

// Standard TTL 600 seconds (10 minutes)
const appCache = new NodeCache({ stdTTL: 600 });

module.exports = appCache;
