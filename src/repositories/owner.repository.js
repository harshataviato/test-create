/**
 * @file src/repositories/owner.repository.js
 * @description Provides data access methods for the Owner model.
 * This replaces `OwnerRepository.java` from the original Spring application.
 */

const { Op } = require('sequelize');
const Owner = require('../models/owner.model');
const Pet = require('../models/pet.model');
const PetType = require('../models/pet-type.model');
const Visit = require('../models/visit.model');

/**
 * @module ownerRepository
 * @description Repository for managing `Owner` entities.
 */
const ownerRepository = {

  /**
   * @async @function findByLastNameStartingWith
   * @description Retrieves owners from the data store whose last name starts with the given string,
   * with pagination. Includes their associated pets and each pet's visits and type.
   * Mimics `findByLastNameStartingWith(String lastName, Pageable pageable)`.
   * @param {string} lastName - Value to search for.
   * @param {number} page - The current page number (1-indexed).
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{totalItems: number, totalPages: number, currentPage: number, owners: Array<Owner>}>}
   *   A promise that resolves to an object containing pagination details and an array of Owner objects.
   */
  async findByLastNameStartingWith(lastName, page, pageSize) {
    const offset = (page - 1) * pageSize;

    const whereClause = lastName ? { lastName: { [Op.iLike]: `${lastName}%` } } : {};

    const { count, rows } = await Owner.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Pet,
          as: 'pets',
          include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits', order: [['date', 'ASC']] }],
          order: [['name', 'ASC']] // Order pets by name
        }
      ],
      order: [['lastName', 'ASC']], // Order owners by last name
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(count / pageSize);

    return {
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      owners: rows,
    };
  },

  /**
   * @async @function findById
   * @description Retrieves an owner from the data store by ID.
   * Includes their associated pets and each pet's visits and type.
   * Mimics `findById(Integer id)`.
   * @param {number} id - The ID of the owner to search for.
   * @returns {Promise<Owner|null>} A promise that resolves to the Owner object if found, otherwise null.
   */
  async findById(id) {
    return Owner.findByPk(id, {
      include: [
        {
          model: Pet,
          as: 'pets',
          include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits', order: [['date', 'ASC']] }],
          order: [['name', 'ASC']] // Order pets by name
        }
      ]
    });
  },

  /**
   * @async @function save
   * @description Saves an owner entity to the data store.
   * Handles both creation and update operations.
   * This method will also save associated pets and their visits.
   * @param {Owner} owner - The Owner object to save.
   * @returns {Promise<Owner>} A promise that resolves to the saved Owner object.
   */
  async save(owner) {
    let savedOwner;
    if (owner.isNew()) {
      // Create new owner
      savedOwner = await Owner.create(owner.dataValues);
      // Associate pets if any
      if (owner.pets && owner.pets.length > 0) {
        for (const pet of owner.pets) {
          pet.owner_id = savedOwner.id; // Set foreign key
          const savedPet = await Pet.create(pet.dataValues);
          if (pet.visits && pet.visits.length > 0) {
            for (const visit of pet.visits) {
              visit.pet_id = savedPet.id;
              await Visit.create(visit.dataValues);
            }
          }
        }
      }
    } else {
      // Update existing owner
      await Owner.update(owner.dataValues, { where: { id: owner.id } });
      savedOwner = await this.findById(owner.id); // Re-fetch to get updated associations

      // Update/create associated pets
      if (owner.pets) {
        for (const pet of owner.pets) {
          pet.owner_id = savedOwner.id;
          if (pet.isNew()) {
            await Pet.create(pet.dataValues);
          } else {
            await Pet.update(pet.dataValues, { where: { id: pet.id } });
          }
          // Update/create associated visits for each pet
          if (pet.visits) {
            for (const visit of pet.visits) {
              visit.pet_id = pet.id; // Ensure pet_id is set for visit
              if (visit.isNew()) {
                await Visit.create(visit.dataValues);
              } else {
                await Visit.update(visit.dataValues, { where: { id: visit.id } });
              }
            }
          }
        }
      }
    }
    return this.findById(savedOwner.id); // Return the full updated object with associations
  },

  /**
   * @async @function deleteById
   * @description Deletes an owner from the data store by ID.
   * @param {number} id - The ID of the owner to delete.
   * @returns {Promise<number>} A promise that resolves to the number of deleted rows (1 if successful, 0 otherwise).
   */
  async deleteById(id) {
    return Owner.destroy({
      where: { id }
    });
  }
};

module.exports = ownerRepository;
