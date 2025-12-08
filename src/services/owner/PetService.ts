/**
 * @module services/owner/PetService
 * @description Provides business logic for managing `Pet` entities.
 *              Interacts with `PetRepository`, `OwnerRepository`, and `PetTypeRepository` for data access.
 */

import { petRepository } from '@repositories/owner/PetRepository';
import { ownerRepository } from '@repositories/owner/OwnerRepository';
import { petTypeRepository } from '@repositories/owner/PetTypeRepository';
import { Pet } from '@models/owner/Pet';
import { Owner } from '@models/owner/Owner';
import { PetType } from '@models/owner/PetType';
import { validate } from 'class-validator';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';
import moment from 'moment';

/**
 * @class PetService
 * @description Encapsulates business logic related to Pet entities.
 */
export class PetService {
  private petRepo = petRepository;
  private ownerRepo = ownerRepository;
  private petTypeRepo = petTypeRepository;

  /**
   * @method findPetById
   * @description Finds a pet by its ID, including its owner, type, and visits.
   * @param {number} petId - The ID of the pet to find.
   * @returns {Promise<Pet | null>} The pet object or null if not found.
   */
  async findPetById(petId: number): Promise<Pet | null> {
    return this.petRepo.findByIdWithDetails(petId);
  }

  /**
   * @method findPetTypes
   * @description Retrieves all available pet types.
   * @returns {Promise<PetType[]>} An array of pet types.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.petTypeRepo.findPetTypes();
  }

  /**
   * @method createPet
   * @description Creates a new pet for a given owner.
   * @param {number} ownerId - The ID of the owner.
   * @param {Partial<Pet>} petData - The data for the new pet.
   * @returns {Promise<Pet>} The newly created pet.
   * @throws {HttpError} If owner not found, pet type not found, pet name already exists, or validation fails.
   */
  async createPet(ownerId: number, petData: Partial<Pet>): Promise<Pet> {
    const owner = await this.ownerRepo.findByIdWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
    }

    if (owner.getPetByName(petData.name!)) {
      throw new HttpError(400, i18n.t('duplicate', { field: 'Pet name' }));
    }

    const petType = await this.petTypeRepo.findByName(petData.type!.name);
    if (!petType) {
      throw new HttpError(400, i18n.t('notFound', { field: 'Pet type' }));
    }

    // Validate birthDate if it exists and is in the future
    if (petData.birthDate && moment(petData.birthDate).isAfter(moment())) {
      throw new HttpError(400, i18n.t('typeMismatch.birthDate'));
    }

    const newPet = this.petRepo.create({ ...petData, owner, type: petType });
    const errors = await validate(newPet);
    if (errors.length > 0) {
      const formattedErrors = errors.map(err => {
        const constraints = err.constraints;
        return Object.values(constraints || {}).map(msg => i18n.t(msg)).join(', ');
      });
      throw new HttpError(400, 'Validation failed: ' + formattedErrors.join('; '));
    }

    return this.petRepo.savePet(newPet);
  }

  /**
   * @method updatePet
   * @description Updates an existing pet.
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet to update.
   * @param {Partial<Pet>} petData - The updated pet data.
   * @returns {Promise<Pet>} The updated pet.
   * @throws {HttpError} If owner not found, pet not found, pet type not found, pet name already exists, or validation fails.
   */
  async updatePet(ownerId: number, petId: number, petData: Partial<Pet>): Promise<Pet> {
    const owner = await this.ownerRepo.findByIdWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
    }

    const existingPet = owner.getPetById(petId);
    if (!existingPet) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Pet', id: petId }));
    }

    // Check for duplicate pet name if name is changed
    if (petData.name && petData.name !== existingPet.name) {
      if (owner.getPetByName(petData.name)) {
        throw new HttpError(400, i18n.t('duplicate', { field: 'Pet name' }));
      }
    }

    const petType = await this.petTypeRepo.findByName(petData.type?.name || existingPet.type.name);
    if (!petType) {
      throw new HttpError(400, i18n.t('notFound', { field: 'Pet type' }));
    }

    // Validate birthDate if it exists and is in the future
    if (petData.birthDate && moment(petData.birthDate).isAfter(moment())) {
      throw new HttpError(400, i18n.t('typeMismatch.birthDate'));
    }

    // Update properties manually or use Object.assign
    existingPet.name = petData.name || existingPet.name;
    existingPet.birthDate = petData.birthDate || existingPet.birthDate;
    existingPet.type = petType; // Always update type to the found entity

    const errors = await validate(existingPet);
    if (errors.length > 0) {
      const formattedErrors = errors.map(err => {
        const constraints = err.constraints;
        return Object.values(constraints || {}).map(msg => i18n.t(msg)).join(', ');
      });
      throw new HttpError(400, 'Validation failed: ' + formattedErrors.join('; '));
    }

    return this.petRepo.savePet(existingPet);
  }
}

export const petService = new PetService();
