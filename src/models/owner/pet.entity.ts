/**
 * @module models/owner/pet.entity
 * @description
 * Defines the `Pet` entity, which belongs to an `Owner` and has a `PetType`,
 * along with a collection of `Visit`s.
 */

import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Relation } from 'typeorm';
import { NamedEntity } from '../named.entity';
import { Owner } from './owner.entity';
import { PetType } from './pet-type.entity';
import { Visit } from './visit.entity';
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Pet entity represents an animal owned by an `Owner` in the clinic.
 * It extends `NamedEntity` and includes its birth date, type, and a list of visits.
 */
@Entity('pets')
export class Pet extends NamedEntity {
  /**
   * The birth date of the pet.
   * - Must be a valid date.
   * - Must not be empty.
   * - Stored as a DATE type in the database.
   */
  @Column({ name: 'birth_date', type: 'date' })
  @IsNotEmpty({ message: 'Birth Date is required' })
  @IsDate({ message: 'typeMismatch.birthDate' }) // Custom message for i18n
  @Type(() => Date) // Ensures proper type conversion from string to Date
  birthDate?: Date;

  /**
   * The type of pet (e.g., Cat, Dog, Snake).
   * - `@ManyToOne`: Many pets can be of one type.
   * - `() => PetType`: Specifies the target entity.
   * - `{ eager: true }`: The pet type will be loaded automatically when a pet is retrieved.
   * - `@JoinColumn({ name: 'type_id' })`: Defines the foreign key column in the 'pets' table.
   */
  @ManyToOne(() => PetType, { eager: true })
  @JoinColumn({ name: 'type_id' })
  @IsNotEmpty({ message: 'Type is required' })
  type?: Relation<PetType>; // Use Relation<T> for explicit type safety

  /**
   * The owner of this pet.
   * - `@ManyToOne`: Many pets can belong to one owner.
   * - `() => Owner`: Specifies the target entity.
   * - `owner => owner.pets`: Defines the inverse side of the relationship (Owner's pets property).
   * - `{ onDelete: 'CASCADE' }`: If an owner is deleted, their pets are also deleted.
   */
  @ManyToOne(() => Owner, owner => owner.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' }) // Foreign key column in the 'pets' table
  owner?: Relation<Owner>;

  /**
   * A collection of visits made by this pet to the clinic.
   * - `@OneToMany`: One pet can have many visits.
   * - `() => Visit`: Specifies the target entity.
   * - `visit => visit.pet`: Defines the inverse side of the relationship (Visit's pet property).
   * - `{ cascade: true, eager: true }`:
   *   - `cascade: true`: Operations on the pet will cascade to its visits.
   *   - `eager: true`: Visits will be loaded automatically when a pet is retrieved.
   * - `{ orderBy: { date: 'ASC' }}`: Orders the visits by date when fetched.
   */
  @OneToMany(() => Visit, visit => visit.pet, { cascade: true, eager: true })
  @Type(() => Visit) // Needed for class-transformer to correctly instantiate nested objects
  @ValidateNested({ each: true }) // Validates each visit in the collection
  visits: Visit[] = [];

  /**
   * Adds a new visit to the pet's collection of visits.
   *
   * @param {Visit} visit - The visit to add.
   */
  addVisit(visit: Visit): void {
    this.visits.push(visit);
  }
}
