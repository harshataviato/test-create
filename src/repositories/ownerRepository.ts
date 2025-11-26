/**
 * @module repositories/ownerRepository
 * @description Provides data access operations for the Owner entity using an in-memory store.
 * This repository mimics the functionality of Spring Data JPA repositories, offering methods
 * for finding, saving, and querying Owner objects.
 */

import data, { generateNextId } from '@repositories/inMemoryData';
import { Owner } from '@models/owner';
import { Pet } from '@models/pet';
import { Visit } from '@models/visit';

/**
 * @class OwnerRepository
 * @description Manages CRUD operations and queries for Owner entities within the in-memory data store.
 * This class serves as a repository layer, abstracting the data source details.
 */
export class OwnerRepository {

  /**
   * @method findById
   * @description Retrieves an Owner entity by its unique ID.
   * @param {number} id - The ID of the owner to retrieve.
   * @returns {Owner | undefined} The found Owner entity, or `undefined` if not found.
   */
  findById(id: number): Owner | undefined {
    // Return a deep copy to prevent direct modification of the stored object
    const owner = data.owners.find(o => o.id === id);
    if (!owner) return undefined;

    // Ensure pets and visits are sorted as expected (visits by date, pets by name)
    const clonedOwner = JSON.parse(JSON.stringify(owner)) as Owner;
    clonedOwner.pets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    clonedOwner.pets.forEach(pet => {
      pet.visits.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    return clonedOwner;
  }

  /**
   * @method findByLastNameStartingWith
   * @description Retrieves a list of Owner entities whose last name starts with the given string.
   * This method supports pagination.
   * @param {string} lastName - The starting string for the last name to search for.
   * @param {number} page - The current page number (1-based index).
   * @param {number} pageSize - The number of items per page.
   * @returns {Owner[]} A paginated array of matching Owner entities.
   */
  findByLastNameStartingWith(lastName: string, page: number, pageSize: number): Owner[] {
    const lowerCaseLastName = lastName.toLowerCase();
    const filteredOwners = data.owners.filter(owner =>
      (owner.lastName || '').toLowerCase().startsWith(lowerCaseLastName)
    );

    // Apply sorting (e.g., by last name then first name) for consistent pagination
    filteredOwners.sort((a, b) => {
      const lastNameComparison = (a.lastName || '').localeCompare(b.lastName || '');
      if (lastNameComparison !== 0) {
        return lastNameComparison;
      }
      return (a.firstName || '').localeCompare(b.firstName || '');
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredOwners.slice(startIndex, endIndex).map(owner => JSON.parse(JSON.stringify(owner)) as Owner);
  }

  /**
   * @method countByLastNameStartingWith
   * @description Counts the total number of Owner entities whose last name starts with the given string.
   * @param {string} lastName - The starting string for the last name to count.
   * @returns {number} The total count of matching Owner entities.
   */
  countByLastNameStartingWith(lastName: string): number {
    const lowerCaseLastName = lastName.toLowerCase();
    return data.owners.filter(owner =>
      (owner.lastName || '').toLowerCase().startsWith(lowerCaseLastName)
    ).length;
  }

  /**
   * @method save
   * @description Saves an Owner entity. If the owner has no ID (is new), a new ID is generated.
   * If the owner has an ID, the existing entity is updated.
   * @param {Owner} owner - The Owner entity to save.
   * @returns {Owner} The saved (or updated) Owner entity with its assigned ID.
   */
  save(owner: Owner): Owner {
    if (owner.id === undefined) {
      // New owner
      owner.id = generateNextId('owner');
      owner.isNew = false;
      // Initialize pets and visits arrays if they are null/undefined
      owner.pets = owner.pets || [];
      owner.pets.forEach(pet => {
        pet.id = generateNextId('pet');
        pet.isNew = false;
        pet.ownerId = owner.id!;
        pet.visits = pet.visits || [];
        pet.visits.forEach(visit => {
          visit.id = generateNextId('visit');
          visit.isNew = false;
          visit.petId = pet.id!;
          data.visits.push(visit); // Add to global visits for consistency
        });
      });
      data.owners.push(owner);
    } else {
      // Update existing owner
      const index = data.owners.findIndex(o => o.id === owner.id);
      if (index > -1) {
        // Ensure pets array is not replaced entirely, but updated
        const existingOwner = data.owners[index];
        existingOwner.firstName = owner.firstName;
        existingOwner.lastName = owner.lastName;
        existingOwner.address = owner.address;
        existingOwner.city = owner.city;
        existingOwner.telephone = owner.telephone;
        existingOwner.isNew = false; // Confirm it's not new

        // Handle pet updates/additions within the owner.pets array
        // This is a simplified approach; a real ORM would handle cascades.
        owner.pets.forEach(updatedPet => {
          if (updatedPet.id === undefined) {
            // New pet being added to an existing owner
            updatedPet.id = generateNextId('pet');
            updatedPet.isNew = false;
            updatedPet.ownerId = owner.id!;
            updatedPet.visits = updatedPet.visits || [];
            existingOwner.pets.push(updatedPet);
          } else {
            // Existing pet being updated
            const petIndex = existingOwner.pets.findIndex(p => p.id === updatedPet.id);
            if (petIndex > -1) {
              const existingPet = existingOwner.pets[petIndex];
              existingPet.name = updatedPet.name;
              existingPet.birthDate = updatedPet.birthDate;
              existingPet.type = updatedPet.type;
              existingPet.isNew = false;

              // Handle visits for this pet
              updatedPet.visits.forEach(updatedVisit => {
                if (updatedVisit.id === undefined) {
                  // New visit for an existing pet
                  updatedVisit.id = generateNextId('visit');
                  updatedVisit.isNew = false;
                  updatedVisit.petId = existingPet.id!;
                  existingPet.visits.push(updatedVisit);
                  data.visits.push(updatedVisit);
                } else {
                  // Update existing visit
                  const visitIndex = existingPet.visits.findIndex(v => v.id === updatedVisit.id);
                  if (visitIndex > -1) {
                    const existingVisit = existingPet.visits[visitIndex];
                    existingVisit.date = updatedVisit.date;
                    existingVisit.description = updatedVisit.description;
                    existingVisit.isNew = false;
                  }
                }
              });
            } else {
              // Should not happen if petId is from existing pet, but handles adding a pet with existing ID from somewhere else
              owner.id = generateNextId('owner'); // Assign a new ID to avoid conflict
              owner.isNew = false;
              existingOwner.pets.push(owner);
            }
          }
        });
        data.owners[index] = existingOwner;
      } else {
        // This case indicates an attempt to update a non-existent owner with an ID
        // For in-memory, we might treat it as an add, or throw an error.
        // For now, let's treat it as adding a new owner if ID doesn't exist.
        owner.id = generateNextId('owner'); // Assign a new ID to avoid conflict
        owner.isNew = false;
        owner.pets = owner.pets || [];
        owner.pets.forEach(pet => {
          pet.id = generateNextId('pet');
          pet.isNew = false;
          pet.ownerId = owner.id!;
          pet.visits = pet.visits || [];
          pet.visits.forEach(visit => {
            visit.id = generateNextId('visit');
            visit.isNew = false;
            visit.petId = pet.id!;
            data.visits.push(visit);
          });
        });
        data.owners.push(owner);
      }
    }
    return JSON.parse(JSON.stringify(owner)); // Return a deep copy
  }
}
