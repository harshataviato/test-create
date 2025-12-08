/**
 * @module models/owner/Pet
 * @description Defines the Pet entity, including its type, birth date,
 *              and associated visits. Mimics Spring's `Pet.java`.
 */

import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, IsDate, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { NamedEntity } from '@models/NamedEntity';
import { PetType } from './PetType';
import { Owner } from './Owner';
import { Visit } from './Visit';
import moment from 'moment';

/**
 * @class Pet
 * @extends {NamedEntity}
 * @description Simple business object representing a pet.
 */
@Entity('pets')
export class Pet extends NamedEntity {
  /**
   * @property {Date} birthDate
   * @description The birth date of the pet.
   * @decorator `@Column({ name: 'birth_date', type: 'date' })` - Maps to a 'birth_date' column as a date.
   * @decorator `@IsDate()` - Ensures the property is a valid Date object.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the birth date is not empty.
   */
  @Column({ name: 'birth_date', type: 'date' })
  @Type(() => Date) // Ensures that the value is transformed to a Date object
  @IsDate({ message: 'typeMismatch.birthDate' }) // Custom message key for i18n
  @IsNotEmpty({ message: 'required' })
  birthDate: Date;

  /**
   * @property {PetType} type
   * @description The type of the pet (e.g., cat, dog).
   * @decorator `@ManyToOne(() => PetType, { eager: true })` - Many-to-one relationship with PetType.
   *              `eager: true` means the pet type will be loaded automatically.
   * @decorator `@JoinColumn({ name: 'type_id' })` - Specifies the foreign key column name.
   * @decorator `@ValidateNested()` - Validates the nested PetType object.
   * @decorator `@IsNotEmptyObject()` - Ensures the type object is not empty (e.g. {id:1} is fine, {} is not)
   * Note: The original Spring code used a custom validator for PetType. Here, we rely on TypeORM's
   *      relationship management and class-validator for basic presence. For more complex validation
   *      like 'must exist in DB', custom logic in a service or interceptor would be needed.
   */
  @ManyToOne(() => PetType, { eager: true })
  @JoinColumn({ name: 'type_id' })
  @Type(() => PetType)
  // For validation, instead of IsNotEmptyObject, we rely on the PetType's id being present for an existing type
  // and the PetTypeFormatter ensuring valid types for new pets.
  type: PetType;

  /**
   * @property {Owner} owner
   * @description The owner of the pet. This is the inverse side of the relationship.
   * @decorator `@ManyToOne(() => Owner, owner => owner.pets)` - Many-to-one relationship with Owner.
   *              This is the owning side, but the `owner_id` column is defined on the `pets` table.
   */
  @ManyToOne(() => Owner, (owner) => owner.pets)
  @JoinColumn({ name: 'owner_id' }) // Explicitly define the foreign key column
  owner: Owner;

  /**
   * @property {Visit[]} visits
   * @description A set of visits for this pet, ordered by date ascending.
   * @decorator `@OneToMany(() => Visit, visit => visit.pet, { cascade: true, eager: true })` - One-to-many relationship with Visit.
   *              `cascade: true` means operations on Pet cascade to Visits.
   *              `eager: true` means visits will be loaded automatically when a pet is retrieved.
   */
  @OneToMany(() => Visit, (visit) => visit.pet, { cascade: true, eager: true })
  @Type(() => Visit)
  @ValidateNested({ each: true })
  visits: Visit[];

  constructor(partial?: Partial<Pet>) {
    super(); // Call the constructor of the base class (NamedEntity)
    if (partial) {
      Object.assign(this, partial);
      // Ensure visits array is initialized if not provided or empty
      if (!this.visits) {
        this.visits = [];
      }
    } else {
      this.visits = [];
    }
  }

  /**
   * @method addVisit
   * @description Adds a visit to the pet's collection of visits.
   * @param {Visit} visit - The visit object to add.
   */
  addVisit(visit: Visit): void {
    // Ensure the visit is associated with this pet
    visit.pet = this;
    this.visits.push(visit);
    // Sort visits by date, ascending
    this.visits.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
