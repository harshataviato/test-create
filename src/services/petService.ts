/**
 * @module services/petService
 * @description Provides business logic for managing Pet entities, including operations
 * related to their owners and visits. It orchestrates data operations using OwnerRepository.
 */

import { OwnerRepository } from '@repositories/ownerRepository';
import { Pet } from '@models/pet';
import { Visit } from '@models/visit';

/**
 * @class PetService
 * @description Encapsulates the business rules for managing pets.
 * It interacts with `OwnerRepository` as pets are nested within owners in this domain model.
 */
export class PetService {
  private ownerRepository: OwnerRepository;

  /**
   * @constructor
   * @description Initializes the PetService with an instance of OwnerRepository.
   */
  constructor() {
    this.ownerRepository = new OwnerRepository();
  }

  /**
   * @method findPetByIdForOwner
   * @description Finds a specific pet by its ID within a given owner's pets.
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet to find.
   * @returns {Pet | undefined} The found Pet object, or `undefined` if not found or owner doesn't exist.
   */
  findPetByIdForOwner(ownerId: number, petId: number): Pet | undefined {
    const owner = this.ownerRepository.findById(ownerId);
    if (!owner) {
      return undefined;
    }
    // Return a deep copy to prevent direct modification of stored pet
    const pet = owner.pets.find(p => p.id === petId);
    return pet ? JSON.parse(JSON.stringify(pet)) : undefined;
  }

  /**
   * @method addPetToOwner
   * @description Adds a new pet to an existing owner and saves the owner.
   * @param {number} ownerId - The ID of the owner to add the pet to.
   * @param {Pet} newPet - The new pet object to add. Its ID will be assigned by the repository.
   * @returns {Owner | undefined} The updated owner object, or `undefined` if the owner was not found.
   */
  addPetToOwner(ownerId: number, newPet: Pet): Owner | undefined {
    const owner = this.ownerRepository.findById(ownerId);
    if (!owner) {
      return undefined; // Owner not found
    }

    // Assign ownerId to pet if not already set, ensures relationship integrity
    newPet.ownerId = ownerId;
    newPet.isNew = true; // Mark as new for ID generation in repository

    owner.pets.push(newPet); // Add the new pet to the owner's list
    return this.ownerRepository.save(owner); // Save the owner, which will handle pet ID generation
  }

  /**
   * @method updatePetForOwner
   * @description Updates an existing pet for a given owner.
   * @param {number} ownerId - The ID of the owner.
   * @param {Pet} updatedPet - The pet object with updated details.
   * @returns {Owner | undefined} The updated owner object, or `undefined` if owner or pet not found.
   */
  updatePetForOwner(ownerId: number, updatedPet: Pet): Owner | undefined {
    const owner = this.ownerRepository.findById(ownerId);
    if (!owner) {
      return undefined; // Owner not found
    }

    const petIndex = owner.pets.findIndex(p => p.id === updatedPet.id);
    if (petIndex === -1) {
      return undefined; // Pet not found for this owner
    }

    // Update existing pet's properties
    const existingPet = owner.pets[petIndex];
    existingPet.name = updatedPet.name;
    existingPet.birthDate = updatedPet.birthDate;
    existingPet.type = updatedPet.type;
    existingPet.isNew = false; // Confirm it's not new

    return this.ownerRepository.save(owner); // Save the owner, which updates the pet within it
  }

  /**
   * @method addVisitToPet
   * @description Adds a new visit to a specific pet of an owner and saves the owner.
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet to add the visit to.
   * @param {Visit} newVisit - The new visit object to add. Its ID will be assigned by the repository.
   * @returns {Owner | undefined} The updated owner object, or `undefined` if owner or pet not found.
   */
  addVisitToPet(ownerId: number, petId: number, newVisit: Visit): Owner | undefined {
    const owner = this.ownerRepository.findById(ownerId);
    if (!owner) {
      return undefined; // Owner not found
    }

    const pet = owner.pets.find(p => p.id === petId);
    if (!pet) {
      return undefined; // Pet not found for this owner
    }

    // Assign petId to visit if not already set
    newVisit.petId = petId;
    newVisit.isNew = true; // Mark as new for ID generation in repository

    pet.visits.push(newVisit); // Add the new visit to the pet's list
    return this.ownerRepository.save(owner); // Save the owner, which will handle visit ID generation
  }
}
