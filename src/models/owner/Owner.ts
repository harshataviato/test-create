/**
 * @module models/owner/Owner
 * @description Defines the Owner entity, extending Person with contact information
 *              and a list of associated pets. Mimics Spring's `Owner.java`.
 */

import { Entity, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Person } from '@models/Person';
import { Pet } from './Pet';
import { Visit } from './Visit';
import moment from 'moment';

/**
 * @class Owner
 * @extends {Person}
 * @description Simple JavaBean domain object representing an owner, including their pets.
 */
@Entity('owners')
export class Owner extends Person {
  /**
   * @property {string} address
   * @description The owner's street address.
   * @decorator `@Column({ name: 'address' })` - Maps to an 'address' column in the database.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the address is not blank.
   * @decorator `@MaxLength(255)` - Ensures the address does not exceed 255 characters.
   */
  @Column({ name: 'address', length: 255 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(255, { message: 'Address cannot be longer than 255 characters' })
  address: string;

  /**
   * @property {string} city
   * @description The city where the owner resides.
   * @decorator `@Column({ name: 'city', length: 80 })` - Maps to a 'city' column in the database with max length 80.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the city is not blank.
   * @decorator `@MaxLength(80)` - Ensures the city does not exceed 80 characters.
   */
  @Column({ name: 'city', length: 80 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(80, { message: 'City cannot be longer than 80 characters' })
  city: string;

  /**
   * @property {string} telephone
   * @description The owner's telephone number.
   * @decorator `@Column({ name: 'telephone', length: 20 })` - Maps to a 'telephone' column in the database with max length 20.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the telephone is not blank.
   * @decorator `@Matches(/^\d{10}$/, { message: 'telephone.invalid' })` - Validates that the telephone is a 10-digit number.
   */
  @Column({ name: 'telephone', length: 20 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' })
  telephone: string;

  /**
   * @property {Pet[]} pets
   * @description A list of pets owned by this owner.
   * @decorator `@OneToMany(() => Pet, pet => pet.owner, { cascade: true, eager: true })` - One-to-many relationship with Pet.
   *              `cascade: true` means operations on Owner (e.g., save, remove) will cascade to associated Pets.
   *              `eager: true` means pets will be loaded automatically when an owner is retrieved.
   * @decorator `@Type(() => Pet)` - Ensures proper transformation when deserializing.
   * @decorator `@ValidateNested({ each: true })` - Validates each pet in the array.
   */
  @OneToMany(() => Pet, (pet) => pet.owner, { cascade: true, eager: true })
  @Type(() => Pet)
  @ValidateNested({ each: true })
  pets: Pet[];

  constructor(partial?: Partial<Owner>) {
    super(); // Call the constructor of the base class (Person)
    if (partial) {
      Object.assign(this, partial);
      // Ensure pets array is initialized if not provided or empty
      if (!this.pets) {
        this.pets = [];
      }
    } else {
      this.pets = [];
    }
  }

  /**
   * @method addPet
   * @description Adds a pet to the owner's list of pets if it's a new pet.
   * @param {Pet} pet - The pet to add.
   */
  addPet(pet: Pet): void {
    if (pet.isNew()) {
      // Assign the current owner to the pet before adding
      pet.owner = this;
      this.pets.push(pet);
    }
  }

  /**
   * @method getPet
   * @description Returns the Pet with the given name, or `undefined` if none found for this Owner.
   * @param {string} name - The name of the pet to search for.
   * @returns {Pet | undefined} The Pet with the given name, or `undefined` if no such Pet exists.
   */
  getPetByName(name: string): Pet | undefined {
    return this.getPet(name, false);
  }

  /**
   * @method getPetById
   * @description Returns the Pet with the given ID, or `undefined` if none found for this Owner.
   * @param {number} id - The ID of the pet to search for.
   * @returns {Pet | undefined} The Pet with the given ID, or `undefined` if no such Pet exists.
   */
  getPetById(id: number): Pet | undefined {
    for (const pet of this.pets) {
      if (pet.id !== undefined) {
        if (pet.id === id) {
          return pet;
        }
      }
    }
    return undefined;
  }

  /**
   * @method getPet
   * @description Returns the Pet with the given name, or `undefined` if none found for this Owner.
   * @param {string} name - The name of the pet to search for.
   * @param {boolean} ignoreNew - Whether to ignore new pets (pets that are not saved yet).
   * @returns {Pet | undefined} The Pet with the given name, or `undefined` if no such Pet exists for this Owner.
   */
  getPet(name: string, ignoreNew: boolean = false): Pet | undefined {
    for (const pet of this.pets) {
      if (pet.name && pet.name.toLowerCase() === name.toLowerCase()) {
        if (!ignoreNew || !pet.isNew()) {
          return pet;
        }
      }
    }
    return undefined;
  }

  /**
   * @method addVisit
   * @description Adds the given `Visit` to the `Pet` with the given identifier.
   * @param {number} petId - The identifier of the `Pet`. Must not be `null`.
   * @param {Visit} visit - The visit to add. Must not be `null`.
   * @throws {Error} If `petId` or `visit` is null, or if the `Pet` with the given `petId` is not found.
   */
  addVisit(petId: number, visit: Visit): void {
    if (petId === null || petId === undefined) {
      throw new Error('Pet identifier must not be null!');
    }
    if (visit === null || visit === undefined) {
      throw new Error('Visit must not be null!');
    }

    const pet = this.getPetById(petId);

    if (!pet) {
      throw new Error(`Invalid Pet identifier! Pet with ID ${petId} not found.`);
    }

    pet.addVisit(visit);
  }

  /**
   * @method toString
   * @description Provides a detailed string representation of the Owner instance.
   * @returns {string} The formatted string containing owner details.
   */
  override toString(): string {
    return `Owner { id: ${this.id}, new: ${this.isNew()}, lastName: ${this.lastName}, ` +
           `firstName: ${this.firstName}, address: ${this.address}, city: ${this.city}, ` +
           `telephone: ${this.telephone} }`;
  }
}
