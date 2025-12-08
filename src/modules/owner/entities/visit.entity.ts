import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity'; // Adjust path as needed
import { Pet } from './pet.entity'; // Adjust path as needed

/**
 * Visit entity represents a visit made by a pet to the clinic.
 * It extends `BaseEntity` and includes properties like visit date and description.
 */
@Entity('visits') // Specifies the table name in the database
export class Visit extends BaseEntity {
  /**
   * The date of the visit.
   * Formatted as "YYYY-MM-DD".
   * This field cannot be null.
   * Defaults to the current date upon creation.
   * @example "2023-11-20"
   */
  @Column({ name: 'visit_date', type: 'date' })
  @IsDate({ message: 'date.invalid' })
  @IsNotEmpty({ message: 'date.required' })
  @Type(() => Date) // Ensure proper date transformation from string if needed
  date: Date;

  /**
   * A description of the visit.
   * This field cannot be blank and must be a string.
   * @example "Annual check-up and vaccinations."
   */
  @Column()
  @IsString({ message: 'description.invalid' })
  @IsNotEmpty({ message: 'description.required' })
  description: string;

  /**
   * The pet associated with this visit.
   * This is a many-to-one relationship with `Pet` entity.
   */
  @ManyToOne(() => Pet, (pet) => pet.visits)
  @JoinColumn({ name: 'pet_id' }) // Specifies the foreign key column in the 'visits' table
  pet: Pet;

  /**
   * Creates a new instance of Visit, defaulting the visit date to the current date.
   */
  constructor() {
    super(); // Call the constructor of BaseEntity
    this.date = new Date(); // Set default date to current date
  }
}
