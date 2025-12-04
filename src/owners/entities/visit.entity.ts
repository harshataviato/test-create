import { Entity, Column, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsString, IsDate, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import * as dayjs from 'dayjs';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pet } from './pet.entity'; // Import Pet entity for the relationship

/**
 * @module Owners
 * @description
 * Represents a visit made by a pet to the clinic.
 * Each visit has a date, a description, and is associated with a specific pet.
 */
@Entity('visits') // Maps to the 'visits' table in the database
export class Visit extends BaseEntity {
  /**
   * The date of the visit.
   * Mapped to the 'visit_date' column in the database.
   * It's automatically set to the current date upon creation if not provided.
   * Uses `@Transform` to handle date string to Date object conversion.
   */
  @Column({ name: 'visit_date', type: 'date' })
  @IsDate({ message: 'Date must be a valid date' })
  @IsNotEmpty({ message: 'Date is required' })
  @Transform(({ value }) => (value ? dayjs(value).toDate() : null))
  date: Date;

  /**
   * A description of the visit.
   * Cannot be blank.
   */
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be blank' })
  @MaxLength(255)
  description: string;

  /**
   * The pet associated with this visit.
   * This is a Many-to-One relationship; many visits can belong to one pet.
   * The `pet_id` foreign key is managed by TypeORM.
   * This property is implicitly defined by TypeORM for the relationship, but
   * explicitly defining it helps with clarity and typing.
   */
  @ManyToOne(() => Pet, (pet) => pet.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' }) // Specifies the foreign key column
  pet: Pet;

  /**
   * Constructor for Visit.
   * Initializes the visit date to the current date if not provided.
   */
  constructor() {
    super(); // Call the constructor of BaseEntity
    if (!this.date) {
      this.date = dayjs().toDate(); // Set to current date using dayjs
    }
  }
}
