/**
 * @module services/owner/VisitService
 * @description Provides business logic for managing `Visit` entities.
 *              Interacts with `OwnerRepository` for data access.
 */

import { ownerRepository } from '@repositories/owner/OwnerRepository';
import { Visit } from '@models/owner/Visit';
import { Owner } from '@models/owner/Owner';
import { validate } from 'class-validator';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';

/**
 * @class VisitService
 * @description Encapsulates business logic related to Visit entities.
 */
export class VisitService {
  private ownerRepo = ownerRepository;

  /**
   * @method addVisitToPet
   * @description Adds a new visit to a specific pet of an owner.
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet.
   * @param {Partial<Visit>} visitData - The data for the new visit.
   * @returns {Promise<Owner>} The updated owner object (with the new visit).
   * @throws {HttpError} If owner or pet not found, or validation fails.
   */
  async addVisitToPet(ownerId: number, petId: number, visitData: Partial<Visit>): Promise<Owner> {
    const owner = await this.ownerRepo.findByIdWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
    }

    const pet = owner.getPetById(petId);
    if (!pet) {
      throw new HttpError(404, i18n.t('notFound', { field: 'Pet', id: petId }));
    }

    const newVisit = new Visit(visitData);
    newVisit.pet = pet; // Ensure the visit is correctly linked to the pet

    const errors = await validate(newVisit);
    if (errors.length > 0) {
      const formattedErrors = errors.map(err => {
        const constraints = err.constraints;
        return Object.values(constraints || {}).map(msg => i18n.t(msg)).join(', ');
      });
      throw new HttpError(400, 'Validation failed: ' + formattedErrors.join('; '));
    }

    owner.addVisit(petId, newVisit); // Adds the visit to the pet within the owner object
    return this.ownerRepo.saveOwner(owner); // Save the owner, which cascades to pets and visits
  }
}

export const visitService = new VisitService();
