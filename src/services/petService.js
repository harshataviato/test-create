/**
 * @file services/petService.js
 * @description Service layer for Pet-related business logic.
 * Interacts with the Pet and PetType models for data access.
 * Mimics the business logic often found in Spring PetClinic's `PetRepository` and related services.
 */

const sequelize = require('../config/database');
const { Pet, Owner, PetType, Visit } = require('../config/database').models;

/**
 * @function findPetById
 * @description Retrieves a pet by its ID.
 * @param {number} id - The ID of the pet to retrieve.
 * @returns {Promise<Pet|null>} A promise that resolves to the Pet object, or null if not found.
 */
exports.findPetById = async (id) => {
  return await Pet.findByPk(id, {
    include: [{ model: PetType, as: 'type' }, { model: Owner, as: 'owner' }]
  });
};

/**
 * @function findPetByIdAndOwnerId
 * @description Retrieves a pet by its ID and owner ID.
 * @param {number} petId - The ID of the pet to retrieve.
 * @param {number} ownerId - The ID of the owner the pet belongs to.
 * @returns {Promise<Pet|null>} A promise that resolves to the Pet object, or null if not found or not belonging to the owner.
 */
exports.findPetByIdAndOwnerId = async (petId, ownerId) => {
  return await Pet.findOne({
    where: { id: petId, ownerId: ownerId },
    include: [{ model: PetType, as: 'type' }, { model: Owner, as: 'owner' }]
  });
};


/**
 * @function savePet
 * @description Saves a new pet or updates an existing one in the database.
 * @param {Pet} pet - The Pet object to save.
 * @returns {Promise<Pet>} A promise that resolves to the saved Pet object.
 */
exports.savePet = async (pet) => {
  if (pet.isNew()) {
    return await Pet.create(pet.toJSON());
  } else {
    const existingPet = await Pet.findByPk(pet.id);
    if (!existingPet) {
      throw new Error(`Pet with ID ${pet.id} not found for update.`);
    }
    await existingPet.update(pet.toJSON());
    return existingPet;
  }
};

/**
 * @function updatePet
 * @description Updates an existing pet in the database.
 * @param {number} id - The ID of the pet to update.
 * @param {object} petData - Object containing updated pet details.
 * @returns {Promise<Pet|null>} A promise that resolves to the updated Pet object, or null if not found.
 */
exports.updatePet = async (id, petData) => {
  const pet = await Pet.findByPk(id);
  if (!pet) {
    return null;
  }
  await pet.update(petData);
  return pet;
};
