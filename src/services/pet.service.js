/**
 * @file src/services/pet.service.js
 * @description Business logic layer for Pet related operations.
 * This acts as an intermediary between controllers and repositories.
 */

const petTypeRepository = require('../repositories/pet-type.repository');
const Pet = require('../models/pet.model');

/**
 * @module petService
 * @description Service layer for Pet operations.
 */
const petService = {

  /**
   * @async @function getAllPetTypes
   * @description Retrieves all available pet types.
   * @returns {Promise<Array<PetType>>} An array of pet type objects.
   */
  async getAllPetTypes() {
    return petTypeRepository.findPetTypes();
  },

  /**
   * @async @function getPetById
   * @description Retrieves a pet by its ID.
   * @param {number} petId - The ID of the pet.
   * @returns {Promise<Pet|null>} The pet object or null if not found.
   */
  async getPetById(petId) {
    return Pet.findByPk(petId);
  },

  /**
   * @async @function createPet
   * @description Creates a new pet for a given owner.
   * @param {number} ownerId - The ID of the owner.
   * @param {object} petData - Data for the new pet.
   * @returns {Promise<Pet>} The newly created pet object.
   */
  async createPet(ownerId, petData) {
    // Note: The owner repository's save method handles pet creation directly when passed an owner object with new pets.
    // For a standalone pet creation, we would directly use Pet.create({ ...petData, owner_id: ownerId });
    // This method is primarily used for validation checks, the actual persistence is handled via owner.save()
    const newPet = Pet.build({ ...petData, owner_id: ownerId });
    return newPet;
  },

  /**
   * @async @function updatePet
   * @description Updates an existing pet.
   * @param {number} petId - The ID of the pet to update.
   * @param {object} petData - The updated data for the pet.
   * @returns {Promise<Pet>} The updated pet object.
   * @throws {Error} If pet is not found.
   */
  async updatePet(petId, petData) {
    const existingPet = await Pet.findByPk(petId);
    if (!existingPet) {
      throw new Error(`Pet not found with id: ${petId}`);
    }

    Object.assign(existingPet, petData);
    await existingPet.save();
    return existingPet;
  },

  /**
   * @async @function deletePet
   * @description Deletes a pet by ID.
   * @param {number} petId - The ID of the pet to delete.
   * @returns {Promise<number>} The number of affected rows (1 if deleted, 0 if not found).
   */
  async deletePet(petId) {
    return Pet.destroy({
      where: { id: petId }
    });
  }
};

module.exports = petService;
