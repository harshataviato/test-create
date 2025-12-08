/**
 * @module models/owner/Visit
 * @description Defines the Visit entity, representing a veterinary visit for a pet.
 *              Mimics Spring's `Visit.java`.
 */

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from '@models/BaseEntity';
import { Pet } from './Pet';
import moment from 'moment';

/**
 * @class Visit
 * @extends {BaseEntity}
 * @description Simple JavaBean domain object representing a visit.
 */
@Entity('visits')
export class Visit extends BaseEntity {
  /**
   * @property {Date} date
   * @description The date of the visit. Defaults to the current date.
   * @decorator `@Column({ name: 'visit_date', type: 'date' })` - Maps to a 'visit_date' column as a date.
   * @decorator `@IsDate()` - Ensures the property is a valid Date object.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the visit date is not empty.
   */
  @Column({ name: 'visit_date', type: 'date' })
  @Type(() => Date) // Ensures that the value is transformed to a Date object
  @IsDate({ message: 'typeMismatch.date' }) // Custom message key for i18n
  @IsNotEmpty({ message: 'required' })
  date: Date;

  /**
   * @property {string} description
   * @description A description of the visit.
   * @decorator `@Column({ name: 'description', length: 255 })` - Maps to a 'description' column with max length 255.
   * @decorator `@IsString()` - Ensures the property is a string.
   * @decorator `@IsNotEmpty({ message: 'required' })` - Ensures the description is not blank.
   * @decorator `@MaxLength(255)` - Ensures the description does not exceed 255 characters.
   */
  @Column({ name: 'description', length: 255 })
  @IsString()
  @IsNotEmpty({ message: 'required' })
  @MaxLength(255, { message: 'Description cannot be longer than 255 characters' })
  description: string;

  /**
   * @property {Pet} pet
   * @description The pet associated with this visit.
   * @decorator `@ManyToOne(() => Pet, pet => pet.visits)` - Many-to-one relationship with Pet.
   * @decorator `@JoinColumn({ name: 'pet_id' })` - Specifies the foreign key column name.
   */
  @ManyToOne(() => Pet, (pet) => pet.visits)
  @JoinColumn({ name: 'pet_id' }) // Explicitly define the foreign key column
  pet: Pet;

  constructor(partial?: Partial<Visit>) {
    super(); // Call the constructor of the base class (BaseEntity)
    Object.assign(this, partial);
    // Initialize date to current date if not provided in partial
    if (!this.date) {
      this.date = moment().toDate();
    }
  }
}
