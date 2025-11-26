/**
 * @module repositories/index
 * @description Aggregates and exports all repository classes from this directory.
 * This provides a single point of import for all data access layers,
 * simplifying dependency management in services and controllers.
 */

export * from './ownerRepository';
export * from './petTypeRepository';
export * from './vetRepository';
// Add other repositories here as they are created
