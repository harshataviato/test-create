import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsPhoneNumber, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Person } from '../../common/entities/person.entity';
import { Pet } from './pet.entity';
import { Visit } from './visit.entity';

/**
 * @module Owners
 * @description
 * Represents an owner of pets in the PetClinic system.
 * This entity extends `Person`, inheriting `id`, `firstName`, and `lastName` properties.
 * Owners have an address, city, and telephone number, and can own multiple pets.
 */
@Entity('owners') // Maps to the 'owners' table in the database
export class Owner extends Person {
  /**
   * The street address of the owner.
   * Cannot be blank.
   */
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty({ message: 'Address cannot be blank' })
  @MaxLength(255)
  address: string;

  /**
   * The city where the owner resides.
   * Cannot be blank.
   */
  @Column({ length: 80 })
  @IsString()
  @IsNotEmpty({ message: 'City cannot be blank' })
  @MaxLength(80)
  city: string;

  /**
   * The telephone number of the owner.
   * Must be a 10-digit number.
   * Uses a regular expression for validation and `@IsPhoneNumber` for semantic validation.
   */
  @Column({ length: 20 })
  @IsString()
  @IsNotEmpty({ message: 'Telephone cannot be blank' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' }) // Custom validation message via i18n
  @MaxLength(20)
  telephone: string;

  /**
   * A collection of pets owned by this owner.
   * This is a One-to-Many relationship; one owner can have multiple pets.
   * `cascade: true` ensures that when an owner is saved/removed, their associated pets are also handled.
   * `eager: true` ensures pets are loaded automatically with the owner.
   * Pets are ordered by their name.
   */
  @OneToMany(() => Pet, (pet) => pet.owner, { cascade: ['insert', 'update', 'remove'], eager: true })
  @JoinColumn({ name: 'owner_id' }) // Specifies the foreign key column in the 'pets' table
  @Type(() => Pet) // Needed for class-transformer to properly deserialize nested Pet objects
  pets: Pet[];

  /**
   * Adds a new pet to the owner's collection of pets.
   * Only adds the pet if it's considered "new" (i.e., has no ID yet).
   *
   * @param {Pet} pet - The pet to add.
   */
  addPet(pet: Pet): void {
    if (pet.isNew()) {
      if (!this.pets) {
        this.pets = [];
      }
      this.pets.push(pet);
      pet.owner = this; // Ensure bidirectional relationship is set
    }
  }

  /**
   * Retrieves a pet by its name from the owner's collection.
   *
   * @param {string} name - The name of the pet to find.
   * @returns {Pet | undefined} The pet if found, otherwise `undefined`.
   */
  getPetByName(name: string): Pet | undefined {
    return this.getPetByNameWithNewFlag(name, false);
  }

  /**
   * Retrieves a pet by its ID from the owner's collection.
   *
   * @param {number} id - The ID of the pet to find.
   * @returns {Pet | undefined} The pet if found, otherwise `undefined`.
   */
  getPet(id: number): Pet | undefined {
    return this.pets?.find((pet) => !pet.isNew() && pet.id === id);
  }

  /**
   * Retrieves a pet by its name from the owner's collection, with an option to ignore new (unsaved) pets.
   *
   * @param {string} name - The name of the pet to find.
   * @param {boolean} ignoreNew - If `true`, new pets (without an ID) will be ignored during the search.
   * @returns {Pet | undefined} The pet if found, otherwise `undefined`.
   */
  getPetByNameWithNewFlag(name: string, ignoreNew: boolean): Pet | undefined {
    return this.pets?.find((pet) => {
      const compName = pet.name;
      return compName && compName.toLowerCase() === name.toLowerCase() && (ignoreNew ? !pet.isNew() : true);
    });
  }

  /**
   * Adds a visit to a specific pet of this owner.
   *
   * @param {number} petId - The ID of the pet to add the visit to.
   * @param {Visit} visit - The visit object to add.
   * @throws {Error} If `petId` or `visit` is null, or if the pet with `petId` is not found.
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
      throw new Error(`Invalid Pet identifier! Pet with ID ${petId} not found.`);
    }

    pet.addVisit(visit);
  }
}
