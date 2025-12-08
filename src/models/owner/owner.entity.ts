/**
 * @module models/owner/owner.entity
 * @description
 * Defines the `Owner` entity, extending `Person` and including properties
 * for address, city, telephone, and a collection of `Pet`s.
 */

import { Entity, Column, OneToMany } from 'typeorm';
import { Person } from '../person.entity';
import { Pet } from './pet.entity';
import { IsNotEmpty, IsString, MaxLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Owner entity represents a pet owner in the clinic.
 * It extends the `Person` entity and adds contact information and a list of owned pets.
 */
@Entity('owners')
export class Owner extends Person {
  /**
   * The address of the owner.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 255 characters.
   */
  @Column({ length: 255 })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address cannot be longer than 255 characters' })
  address?: string;

  /**
   * The city where the owner resides.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 80 characters.
   */
  @Column({ length: 80 })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  @MaxLength(80, { message: 'City cannot be longer than 80 characters' })
  city?: string;

  /**
   * The telephone number of the owner.
   * - Must not be empty.
   * - Must be a 10-digit numeric string.
   * - Maximum length of 20 characters (to allow for various international formats or future changes).
   */
  @Column({ length: 20 })
  @IsNotEmpty({ message: 'Telephone is required' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' }) // Custom message for i18n
  @IsString({ message: 'Telephone must be a string' })
  @MaxLength(20, { message: 'Telephone cannot be longer than 20 characters' })
  telephone?: string;

  /**
   * A collection of pets owned by this owner.
   * - `@OneToMany`: One owner can have many pets.
   * - `() => Pet`: Specifies the target entity.
   * - `pet => pet.owner`: Defines the inverse side of the relationship (Pet's owner property).
   * - `{ cascade: true, eager: true }`:
   *   - `cascade: true`: Operations (insert, update, delete) on the owner will cascade to its pets.
   *   - `eager: true`: Pets will be loaded automatically when an owner is retrieved.
   * - `{ orderBy: { name: 'ASC' }}`: Orders the pets by name when fetched.
   */
  @OneToMany(() => Pet, pet => pet.owner, { cascade: true, eager: true })
  @Type(() => Pet) // Needed for class-transformer to correctly instantiate nested objects
  @ValidateNested({ each: true }) // Validates each pet in the collection
  pets: Pet[] = [];

  /**
   * Adds a new pet to the owner's collection of pets.
   * If the pet is new (has no ID), it is added to the list.
   *
   * @param {Pet} pet - The pet to add.
   */
  addPet(pet: Pet): void {
    if (pet.isNew()) {
      this.pets.push(pet);
    }
  }

  /**
   * Retrieves a pet by its name from the owner's collection.
   *
   * @param {string} name - The name of the pet to find.
   * @returns {Pet | undefined} The found pet, or `undefined` if no pet with the given name exists.
   */
  getPetByName(name: string): Pet | undefined {
    return this.getPetByName(name, false);
  }

  /**
   * Retrieves a pet by its ID from the owner's collection.
   *
   * @param {number} id - The ID of the pet to find.
   * @returns {Pet | undefined} The found pet, or `undefined` if no pet with the given ID exists.
   */
  getPet(id: number): Pet | undefined {
    if (this.pets) {
      for (const pet of this.pets) {
        if (pet.id !== undefined && pet.id === id) {
          return pet;
        }
      }
    }
    return undefined;
  }

  /**
   * Retrieves a pet by its name from the owner's collection, with an option to ignore new pets.
   *
   * @param {string} name - The name of the pet to find.
   * @param {boolean} ignoreNew - If `true`, only returns pets that have been persisted (have an ID).
   * @returns {Pet | undefined} The found pet, or `undefined` if no such pet exists for this owner.
   */
  getPetByName(name: string, ignoreNew: boolean): Pet | undefined {
    if (this.pets) {
      for (const pet of this.pets) {
        if (pet.name?.toLowerCase() === name.toLowerCase()) {
          if (!ignoreNew || !pet.isNew()) {
            return pet;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Adds a visit to a specific pet owned by this owner.
   *
   * @param {number} petId - The ID of the pet to which the visit should be added. Must not be null.
   * @param {Visit} visit - The visit object to add. Must not be null.
   * @throws {Error} If `petId` or `visit` is null, or if no pet with the given `petId` is found.
   */
  addVisit(petId: number, visit: Visit): void {
    if (petId === null || petId === undefined) {
      throw new Error('Pet identifier must not be null!');
    }
    if (visit === null || visit === undefined) {
      throw new Error('Visit must not be null!');
    }

    const pet = this.getPet(petId);
    if (!pet) {
      throw new Error('Invalid Pet identifier!');
    }

    pet.addVisit(visit);
  }

  /**
   * Returns a string representation of the Owner, including various properties.
   * @returns {string} A string representation of the Owner.
   */
  toString(): string {
    return `Owner(id=${this.id}, new=${this.isNew()}, lastName=${this.lastName}, ` +
           `firstName=${this.firstName}, address=${this.address}, city=${this.city}, ` +
           `telephone=${this.telephone})`;
  }
}
