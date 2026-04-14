/**
 * @file OwnerRepository module.
 * @description Provides data access methods for `Owner` entities, mimicking Spring Data JPA repositories.
 * It interacts with the PostgreSQL database using direct SQL queries.
 * @author Google Senior Engineer
 */

const { query } = require('../db/pool');
const Owner = require('../models/owner');
const Pet = require('../models/pet');
const PetType = require('../models/petType');
const Visit = require('../models/visit');

/**
 * Maps a database row to an `Owner` object with nested `Pet` and `Visit` objects.
 * This is a helper function to reconstruct the complex `Owner` object from flat SQL results.
 * @param {Array<Object>} rows - Array of database rows, typically from a JOIN query.
 * @returns {Owner|null} A fully constructed `Owner` object or null if no rows.
 */
function mapRowsToOwner(rows) {
  if (rows.length === 0 || !rows[0].owner_id) { // Check for actual owner data
    return null;
  }

  // Initialize owner from the first row
  const ownerData = rows[0];
  const owner = new Owner({
    id: ownerData.owner_id,
    firstName: ownerData.owner_first_name,
    lastName: ownerData.owner_last_name,
    address: ownerData.owner_address,
    city: ownerData.owner_city,
    telephone: ownerData.owner_telephone,
    pets: []
  });

  const petsMap = new Map();

  rows.forEach(row => {
    // Process pets
    if (row.pet_id && !petsMap.has(row.pet_id)) {
      const pet = new Pet({
        id: row.pet_id,
        name: row.pet_name,
        birthDate: row.pet_birth_date,
        type: row.type_id ? new PetType(row.type_id, row.type_name) : null,
        visits: []
      });
      petsMap.set(row.pet_id, pet);
      owner.addPet(pet); // Use addPet to properly manage pet collection
    }

    // Process visits
    if (row.visit_id && petsMap.has(row.pet_id)) {
      const pet = petsMap.get(row.pet_id);
      const visit = new Visit({
        id: row.visit_id,
        date: row.visit_date,
        description: row.visit_description
      });
      pet.addVisit(visit); // Use addVisit to properly manage visit collection
    }
  });

  return owner;
}

/**
 * Maps database rows to an array of `Owner` objects, handling multiple owners and their pets/visits.
 * @param {Array<Object>} rows - Array of database rows.
 * @returns {Array<Owner>} An array of fully constructed `Owner` objects.
 */
function mapRowsToOwnersList(rows) {
  const ownersMap = new Map();

  rows.forEach(row => {
    // If owner not yet in map, create new Owner instance
    if (!ownersMap.has(row.owner_id)) {
      ownersMap.set(row.owner_id, new Owner({
        id: row.owner_id,
        firstName: row.owner_first_name,
        lastName: row.owner_last_name,
        address: row.owner_address,
        city: row.owner_city,
        telephone: row.owner_telephone,
        pets: []
      }));
    }
    const owner = ownersMap.get(row.owner_id);

    // If pet exists for this row and not yet added to owner's pets
    if (row.pet_id && !owner.getPets().some(p => p.getId() === row.pet_id)) {
      const pet = new Pet({
        id: row.pet_id,
        name: row.pet_name,
        birthDate: row.pet_birth_date,
        type: row.type_id ? new PetType(row.type_id, row.type_name) : null,
        visits: []
      });
      owner.addPet(pet);
    }
    const pet = owner.getPets().find(p => p.getId() === row.pet_id);

    // If visit exists for this row and not yet added to pet's visits
    if (row.visit_id && pet && !pet.getVisits().some(v => v.getId() === row.visit_id)) {
      const visit = new Visit({
        id: row.visit_id,
        date: row.visit_date,
        description: row.visit_description
      });
      pet.addVisit(visit);
    }
  });

  return Array.from(ownersMap.values());
}


/**
 * Retrieves an `Owner` from the data store by ID, including all their pets and visits.
 * @param {number} id - The ID of the owner to retrieve.
 * @returns {Promise<Owner|null>} A promise that resolves to an `Owner` object or null if not found.
 */
async function findById(id) {
  const res = await query(`
    SELECT
      o.id AS owner_id, o.first_name AS owner_first_name, o.last_name AS owner_last_name,
      o.address AS owner_address, o.city AS owner_city, o.telephone AS owner_telephone,
      p.id AS pet_id, p.name AS pet_name, p.birth_date AS pet_birth_date,
      pt.id AS type_id, pt.name AS type_name,
      v.id AS visit_id, v.visit_date AS visit_date, v.description AS visit_description
    FROM owners o
    LEFT JOIN pets p ON o.id = p.owner_id
    LEFT JOIN types pt ON p.type_id = pt.id
    LEFT JOIN visits v ON p.id = v.pet_id
    WHERE o.id = $1
    ORDER BY p.name, v.visit_date ASC;
  `, [id]);

  return mapRowsToOwner(res.rows);
}

/**
 * Retrieves `Owner`s from the data store whose last name starts with the given name, with pagination.
 * @param {string} lastName - Value to search for.
 * @param {number} page - Current page number (1-indexed).
 * @param {number} pageSize - Number of records per page.
 * @returns {Promise<object>} A promise that resolves to an object containing paginated owner data.
 *   { count: number, rows: Array<Owner>, totalPages: number, currentPage: number }
 */
async function findByLastNameStartingWith(lastName, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const searchPattern = lastName ? `${lastName}%` : '%'; // Case-insensitive search for starting characters

  // Query to get total count
  const countRes = await query(`
    SELECT COUNT(DISTINCT o.id) AS total_count
    FROM owners o
    WHERE o.last_name ILIKE $1;
  `, [searchPattern]);
  const totalCount = parseInt(countRes.rows[0].total_count, 10);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Query to get paginated owners with their pets and visits
  // We need to fetch all related pets/visits for the owners on the current page.
  // This means fetching all rows for these owners and then aggregating them.
  const ownersOnPageRes = await query(`
    SELECT DISTINCT o.id
    FROM owners o
    WHERE o.last_name ILIKE $1
    ORDER BY o.id
    LIMIT $2 OFFSET $3;
  `, [searchPattern, pageSize, offset]);

  const ownerIdsOnPage = ownersOnPageRes.rows.map(row => row.id);

  if (ownerIdsOnPage.length === 0) {
    return {
      totalItems: totalCount,
      listOwners: [],
      totalPages,
      currentPage: page
    };
  }

  const ownersWithDetailsRes = await query(`
    SELECT
      o.id AS owner_id, o.first_name AS owner_first_name, o.last_name AS owner_last_name,
      o.address AS owner_address, o.city AS owner_city, o.telephone AS owner_telephone,
      p.id AS pet_id, p.name AS pet_name, p.birth_date AS pet_birth_date,
      pt.id AS type_id, pt.name AS type_name,
      v.id AS visit_id, v.visit_date AS visit_date, v.description AS visit_description
    FROM owners o
    LEFT JOIN pets p ON o.id = p.owner_id
    LEFT JOIN types pt ON p.type_id = pt.id
    LEFT JOIN visits v ON p.id = v.pet_id
    WHERE o.id = ANY($1::int[])
    ORDER BY o.last_name, o.first_name, p.name, v.visit_date;
  `, [ownerIdsOnPage]);


  // Reconstruct owner objects from flat results
  const owners = mapRowsToOwnersList(ownersWithDetailsRes.rows);

  return {
    totalItems: totalCount,
    listOwners: owners,
    totalPages,
    currentPage: page
  };
}


/**
 * Saves an `Owner` object to the database (either inserts a new owner or updates an existing one).
 * Handles saving associated pets and visits.
 * @param {Owner} owner - The `Owner` object to save.
 * @returns {Promise<Owner>} A promise that resolves to the saved `Owner` object with its ID populated.
 */
async function save(owner) {
  if (owner.isNew()) {
    // Insert new owner
    const res = await query(`
      INSERT INTO owners (first_name, last_name, address, city, telephone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [owner.firstName, owner.lastName, owner.address, owner.city, owner.telephone]);
    owner.setId(res.rows[0].id); // Set the generated ID

    // Save new pets associated with this owner
    for (const pet of owner.getPets()) {
      if (pet.isNew()) {
        await savePetForOwner(owner.getId(), pet);
      }
    }
  } else {
    // Update existing owner
    await query(`
      UPDATE owners
      SET first_name = $1, last_name = $2, address = $3, city = $4, telephone = $5
      WHERE id = $6;
    `, [owner.firstName, owner.lastName, owner.address, owner.city, owner.telephone, owner.getId()]);

    // Update or insert pets
    for (const pet of owner.getPets()) {
      if (pet.isNew()) {
        await savePetForOwner(owner.getId(), pet);
      } else {
        await updatePetForOwner(owner.getId(), pet);
      }
      // Update or insert visits for each pet
      for (const visit of pet.getVisits()) {
        if (visit.isNew()) {
          await saveVisitForPet(pet.getId(), visit);
        } else {
          await updateVisitForPet(visit);
        }
      }
    }
  }
  return owner;
}

/**
 * Saves a new `Pet` object associated with a specific `Owner` to the database.
 * @param {number} ownerId - The ID of the owner.
 * @param {Pet} pet - The `Pet` object to save.
 * @returns {Promise<Pet>} A promise that resolves to the saved `Pet` object with its ID populated.
 */
async function savePetForOwner(ownerId, pet) {
  const res = await query(`
    INSERT INTO pets (name, birth_date, type_id, owner_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `, [pet.name, pet.birthDate.toISOString().split('T')[0], pet.type.id, ownerId]); // Format date for SQL
  pet.setId(res.rows[0].id);

  for (const visit of pet.getVisits()) {
    if (visit.isNew()) {
      await saveVisitForPet(pet.getId(), visit);
    }
  }
  return pet;
}

/**
 * Updates an existing `Pet` object associated with a specific `Owner` in the database.
 * @param {number} ownerId - The ID of the owner.
 * @param {Pet} pet - The `Pet` object to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updatePetForOwner(ownerId, pet) {
  await query(`
    UPDATE pets
    SET name = $1, birth_date = $2, type_id = $3
    WHERE id = $4 AND owner_id = $5;
  `, [pet.name, pet.birthDate.toISOString().split('T')[0], pet.type.id, pet.id, ownerId]);
}


/**
 * Saves a new `Visit` object associated with a specific `Pet` to the database.
 * @param {number} petId - The ID of the pet.
 * @param {Visit} visit - The `Visit` object to save.
 * @returns {Promise<Visit>} A promise that resolves to the saved `Visit` object with its ID populated.
 */
async function saveVisitForPet(petId, visit) {
  const res = await query(`
    INSERT INTO visits (pet_id, visit_date, description)
    VALUES ($1, $2, $3)
    RETURNING id;
  `, [petId, visit.date.toISOString().split('T')[0], visit.description]); // Format date for SQL
  visit.setId(res.rows[0].id);
  return visit;
}

/**
 * Updates an existing `Visit` object in the database.
 * @param {Visit} visit - The `Visit` object to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateVisitForPet(visit) {
  await query(`
    UPDATE visits
    SET visit_date = $1, description = $2
    WHERE id = $3;
  `, [visit.date.toISOString().split('T')[0], visit.description, visit.id]);
}


module.exports = {
  findById,
  findByLastNameStartingWith,
  save,
  savePetForOwner,
  updatePetForOwner,
  saveVisitForPet,
  updateVisitForPet
};

