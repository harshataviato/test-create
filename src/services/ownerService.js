/**
 * @file services/ownerService.js
 * @description Service layer for Owner-related business logic.
 * Interacts with the Owner, Pet, and Visit models for data access.
 * Mimics the business logic found in Spring PetClinic's `OwnerRepository` and `OwnerService` concepts.
 */

const sequelize = require('../config/database');
const { Owner, Pet, PetType, Visit } = require('../config/database').models;
const { Op } = require('sequelize');

/**
 * @function findOwnerById
 * @description Retrieves an owner by their ID.
 * @param {number} id - The ID of the owner to retrieve.
 * @returns {Promise<Owner|null>} A promise that resolves to the Owner object, or null if not found.
 */
exports.findOwnerById = async (id) => {
  return await Owner.findByPk(id);
};

/**
 * @function findOwnerByIdWithPetsAndVisits
 * @description Retrieves an owner by their ID, including all associated pets and their visits.
 * @param {number} id - The ID of the owner to retrieve.
 * @returns {Promise<Owner|null>} A promise that resolves to the Owner object with nested pets and visits, or null.
 */
exports.findOwnerByIdWithPetsAndVisits = async (id) => {
  return await Owner.findByPk(id, {
    include: [
      {
        model: Pet,
        as: 'pets',
        include: [
          { model: PetType, as: 'type' },
          { model: Visit, as: 'visits', order: [['visitDate', 'ASC']] } // Order visits by date
        ],
        order: [['name', 'ASC']] // Order pets by name
      },
    ],
    order: [
      [{ model: Pet, as: 'pets' }, 'name', 'ASC'], // Order pets within the owner
      [{ model: Pet, as: 'pets' }, { model: Visit, as: 'visits' }, 'visitDate', 'ASC'] // Order visits within each pet
    ]
  });
};


/**
 * @function findPaginatedForOwnersLastName
 * @description Retrieves owners from the data store by last name (or all if last name is empty), with pagination.
 * @param {string} lastName - The last name to search for. Can be a partial match.
 * @param {number} page - The current page number (1-indexed).
 * @param {number} pageSize - The number of owners per page.
 * @returns {Promise<{owners: Owner[], totalItems: number, totalPages: number}>} A promise that resolves to an object
 * containing the list of owners, total count, and total pages.
 */
exports.findPaginatedForOwnersLastName = async (lastName, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const whereClause = lastName
    ? { lastName: { [Op.iLike]: `${lastName}%` } } // Case-insensitive LIKE for PostgreSQL
    : {};

  const { count, rows } = await Owner.findAndCountAll({
    where: whereClause,
    limit: pageSize,
    offset: offset,
    order: [['lastName', 'ASC']], // Order by last name
    include: [{ model: Pet, as: 'pets' }] // Include pets for displaying in the list
  });

  const totalPages = Math.ceil(count / pageSize);

  return { owners: rows, totalItems: count, totalPages: totalPages };
};

/**
 * @function createOwner
 * @description Creates a new owner in the database.
 * @param {object} ownerData - Object containing owner details (firstName, lastName, address, city, telephone).
 * @returns {Promise<Owner>} A promise that resolves to the newly created Owner object.
 */
exports.createOwner = async (ownerData) => {
  return await Owner.create(ownerData);
};

/**
 * @function updateOwner
 * @description Updates an existing owner in the database.
 * @param {number} id - The ID of the owner to update.
 * @param {object} ownerData - Object containing updated owner details.
 * @returns {Promise<Owner|null>} A promise that resolves to the updated Owner object, or null if not found.
 */
exports.updateOwner = async (id, ownerData) => {
  const owner = await Owner.findByPk(id);
  if (!owner) {
    return null;
  }
  await owner.update(ownerData);
  return owner;
};

/**
 * @function addVisitToPet
 * @description Adds a new visit to a specific pet of an owner.
 * This method finds the owner, then the pet, and then creates the visit associated with the pet.
 * @param {number} ownerId - The ID of the owner.
 * @param {number} petId - The ID of the pet.
 * @param {Visit} visit - The visit object to add (should be a Sequelize Visit instance).
 * @returns {Promise<Visit>} A promise that resolves to the newly created Visit object.
 * @throws {Error} If the owner or pet is not found.
 */
exports.addVisitToPet = async (ownerId, petId, visit) => {
  const owner = await Owner.findByPk(ownerId, {
    include: [{ model: Pet, as: 'pets', where: { id: petId }, required: false }]
  });

  if (!owner) {
    throw new Error(`Owner with ID ${ownerId} not found.`);
  }

  const pet = owner.pets && owner.pets.length > 0 ? owner.pets[0] : null;
  if (!pet) {
    throw new Error(`Pet with ID ${petId} not found for owner ID ${ownerId}.`);
  }

  // Ensure visit is associated with the correct pet
  visit.petId = pet.id;
  return await Visit.create(visit.toJSON()); // Create and save the visit
};
