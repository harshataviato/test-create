import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Person } from '../../../common/entities/person.entity'; // Adjust path as needed
import { Pet } from './pet.entity'; // Adjust path as needed

/**
 * Owner entity represents a pet owner in the clinic.
 * It extends the `Person` entity and adds contact information and a list of pets.
 */
@Entity('owners') // Specifies the table name in the database
export class Owner extends Person {
  /**
   * The address of the owner.
   * This field cannot be blank and must be a string.
   * @example "110 W. Liberty St."
   */
  @Column({ name: 'address' })
  @IsString({ message: 'address.invalid' })
  @IsNotEmpty({ message: 'address.required' })
  address: string;

  /**
   * The city where the owner resides.
   * This field cannot be blank and must be a string.
   * @example "Madison"
   */
  @Column({ name: 'city' })
  @IsString({ message: 'city.invalid' })
  @IsNotEmpty({ message: 'city.required' })
  city: string;

  /**
   * The telephone number of the owner.
   * This field cannot be blank and must be a 10-digit numeric string.
   * @example "6085551023"
   */
  @Column({ name: 'telephone' })
  @IsString({ message: 'telephone.invalid' })
  @IsNotEmpty({ message: 'telephone.required' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' }) // Custom validation for 10 digits
  telephone: string;

  /**
   * A list of pets owned by this person.
   * This is a one-to-many relationship with `Pet` entities, eagerly loaded.
   * If an owner is deleted, all their pets are also deleted (cascadeType: ALL).
   * Pets are ordered by their name in ascending order.
   */
  @OneToMany(() => Pet, (pet) => pet.owner, {
    cascade: ['insert', 'update'], // Only cascade insert and update
    eager: true, // Eagerly load pets when retrieving an owner
  })
  @JoinColumn({ name: 'owner_id' }) // Specifies the foreign key column in the 'pets' table
  pets: Pet[] = []; // Initialize as an empty array

  /**
   * Adds a new pet to the owner's collection.
   * If the pet is new (has no ID), it's added to the list.
   * @param pet The pet to add.
   */
  addPet(pet: Pet): void {
    if (pet.isNew()) {
      pet.owner = this; // Set the owner for the pet
      this.pets.push(pet);
    }
  }

  /**
   * Returns the Pet with the given name, or null if none found for this Owner.
   * Searches case-insensitively.
   * @param name The name of the pet to find.
   * @returns The `Pet` object if found, otherwise `undefined`.
   */
  getPet(name: string): Pet | undefined;
  /**
   * Returns the Pet with the given name, or null if none found for this Owner.
   * Searches case-insensitively, optionally ignoring new pets.
   * @param name The name of the pet to find.
   * @param ignoreNew Whether to ignore new pets (pets that are not saved yet).
   * @returns The `Pet` object if found, otherwise `undefined`.
   */
  getPet(name: string, ignoreNew: boolean): Pet | undefined;
  /**
   * Returns the Pet with the given ID, or null if none found for this Owner.
   * @param id The ID of the pet to find.
   * @returns The `Pet` object if found, otherwise `undefined`.
   */
  getPet(id: number): Pet | undefined;
  /**
   * Overloaded method to find a pet by name or ID.
   * @param identifier The name (string) or ID (number) of the pet.
   * @param ignoreNew Optional. If `true`, new pets (without an ID) are ignored when searching by name.
   * @returns The `Pet` object if found, otherwise `undefined`.
   */
  getPet(identifier: string | number, ignoreNew?: boolean): Pet | undefined {
    if (typeof identifier === 'number') {
      // Search by ID
      return this.pets.find((pet) => pet.id === identifier);
    } else if (typeof identifier === 'string') {
      // Search by name
      return this.pets.find((pet) => {
        const compName = pet.name;
        const condition = compName && compName.toLowerCase() === identifier.toLowerCase();
        return ignoreNew ? condition && !pet.isNew() : condition;
      });
    }
    return undefined;
  }

  /**
   * Adds the given `Visit` to the `Pet` with the given identifier.
   * @param petId The identifier of the `Pet`. Must not be `null`.
   * @param visit The visit to add. Must not be `null`.
   * @throws Error if `petId` or `visit` is null, or if the `Pet` is not found.
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
}
