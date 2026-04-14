/**
 * @file services/petTypeService.js
 * @description Service layer for PetType-related business logic.
 * Interacts with the PetType model for data access.
 * Mimics the functionality of Spring PetClinic's `PetTypeRepository`.
 */

const sequelize = require('../config/database');
const { PetType } = require('../config/database').models;

/**
 * @function findAllPetTypes
 * @description Retrieves all pet types from the data store, ordered by name.
 * @returns {Promise<PetType[]>} A promise that resolves to a collection of PetType objects.
 */
exports.findAllPetTypes = async () => {
  return await PetType.findAll({
    order: [['name', 'ASC']]
  });
};

/**
 * @function findPetTypeByName
 * @description Retrieves a single pet type by its name.
 * @param {string} name - The name of the pet type to find.
 * @returns {Promise<PetType|null>} A promise that resolves to the PetType object, or null if not found.
 */
exports.findPetTypeByName = async (name) => {
  return await PetType.findOne({
    where: { name: name }
  });
};
