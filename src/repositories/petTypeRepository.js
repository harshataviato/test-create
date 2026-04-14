/**
 * @file PetTypeRepository module.
 * @description Provides data access methods for `PetType` entities.
 * It fetches pet types from the PostgreSQL database, mimicking Spring Data JPA repositories.
 * @author Google Senior Engineer
 */

const { query } = require('../db/pool');
const PetType = require('../models/petType');

/**
 * Retrieves all `PetType`s from the data store, ordered by name.
 * @returns {Promise<Array<PetType>>} A promise that resolves to a collection of `PetType` objects.
 */
async function findPetTypes() {
  const res = await query(`
    SELECT id, name
    FROM types
    ORDER BY name;
  `);
  // Map database rows to PetType instances
  return res.rows.map(row => new PetType(row.id, row.name));
}

/**
 * Finds a `PetType` by its name (case-insensitive).
 * This is a utility function not directly present in the Java `PetTypeRepository`
 * but useful for parsing and validation where name is used as a lookup key.
 * @param {string} name - The name of the pet type to find.
 * @returns {Promise<PetType|null>} A promise that resolves to a `PetType` object or null if not found.
 */
async function findByName(name) {
  const res = await query(`
    SELECT id, name
    FROM types
    WHERE name ILIKE $1;
  `, [name]); // ILIKE is for case-insensitive comparison in PostgreSQL
  return res.rows.length > 0 ? new PetType(res.rows[0].id, res.rows[0].name) : null;
}

module.exports = {
  findPetTypes,
  findByName
};

