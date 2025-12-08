/**
 * @module models/owner/visit.entity
 * @description
 * Defines the `Visit` entity, representing a visit by a pet to the clinic.
 * It includes the visit date and a description of the visit.
 */

import { Entity, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Pet } from './pet.entity';
import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Visit entity represents an appointment or check-up for a pet at the clinic.
 * It tracks the date of the visit and a description of the visit.
 */
@Entity('visits')
export class Visit extends BaseEntity {
  /**
   * The date of the visit.
   * - Must not be empty.
   * - Must be a valid date.
   * - Stored as a DATE type in the database.
   * - Defaults to the current date upon creation.
   */
  @Column({ name: 'visit_date', type: 'date' })
  @IsNotEmpty({ message: 'Date is required' })
  @IsDate({ message: 'typeMismatch.date' }) // Custom message for i18n
  @Type(() => Date) // Ensures proper type conversion from string to Date
  date: Date = new Date(); // Default to current date

  /**
   * A description of the visit.
   * - Must not be empty.
   * - Must be a string.
   * - Maximum length of 255 characters.
   */
  @Column({ length: 255 })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description cannot be longer than 255 characters' })
  description?: string;

  /**
   * The pet associated with this visit.
   * - `@ManyToOne`: Many visits can belong to one pet.
   * - `() => Pet`: Specifies the target entity.
   * - `pet => pet.visits`: Defines the inverse side of the relationship (Pet's visits property).
   * - `@JoinColumn({ name: 'pet_id' })`: Defines the foreign key column in the 'visits' table.
   * - `{ onDelete: 'CASCADE' }`: If a pet is deleted, its visits are also deleted.
   */
  @ManyToOne(() => Pet, pet => pet.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' }) // Foreign key column in the 'visits' table
  pet?: Relation<Pet>; // Use Relation<T> for explicit type safety
}
