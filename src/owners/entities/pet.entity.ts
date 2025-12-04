import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsDate, MaxLength, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';
import { NamedEntity } from '../../common/entities/named.entity';
import { PetType } from './pet-type.entity';
import { Visit } from './visit.entity';
import { Owner } from './owner.entity'; // Owner entity import for relationship

/**
 * @module Owners
 * @description
 * Represents a pet belonging to an owner.
 * Each pet has a name, birth date, type, and can have multiple visits.
 */
@Entity('pets') // Maps to the 'pets' table in the database
export class Pet extends NamedEntity {
  /**
   * The birth date of the pet.
   * Mapped to the 'birth_date' column in the database.
   * Uses `@Transform` to convert date strings to `Date` objects and vice versa for display.
   */
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  @IsDate({ message: 'Birth Date must be a valid date' })
  @IsNotEmpty({ message: 'Birth Date is required' })
  // Transform to Date object on incoming data, format to 'YYYY-MM-DD' on outgoing data if needed for views
  @Transform(({ value }) => (value ? dayjs(value).toDate() : null), { toClassOnly: true })
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null), { toPlainOnly: true })
  birthDate: Date;

  /**
   * The type of the pet (e.g., Cat, Dog, Hamster).
   * This is a Many-to-One relationship; many pets can be of one type.
   * The `type_id` foreign key is managed by TypeORM.
   */
  @ManyToOne(() => PetType, { eager: true, nullable: false }) // Eagerly load pet type
  @JoinColumn({ name: 'type_id' }) // Specifies the foreign key column
  @ValidateNested() // Validates the nested PetType object
  @Type(() => PetType) // Ensure class-transformer knows the type for nested object transformation
  type: PetType;

  /**
   * The owner of the pet.
   * This is a Many-to-One relationship; many pets can belong to one owner.
   * The `owner_id` foreign key is managed by TypeORM.
   * This field is often populated from the `Owner` context in the application.
   */
  @ManyToOne(() => Owner, (owner) => owner.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' }) // Specifies the foreign key column
  owner: Owner;

  /**
   * A collection of visits made by this pet.
   * This is a One-to-Many relationship; one pet can have multiple visits.
   * Visits are typically ordered by date.
   * `cascade: true` ensures that when a pet is saved/removed, its associated visits are also handled.
   * `eager: true` ensures visits are loaded automatically with the pet.
   */
  @OneToMany(() => Visit, (visit) => visit.pet, { cascade: ['insert', 'update', 'remove'], eager: true })
  @JoinColumn({ name: 'pet_id' }) // The foreign key in the 'visits' table pointing back to 'pets'
  @Type(() => Visit) // Ensure class-transformer knows the type for nested objects
  visits: Visit[];

  /**
   * Adds a new visit to the pet's list of visits.
   * Initializes the visits array if it's null or undefined.
   * @param {Visit} visit - The visit to add.
   */
  addVisit(visit: Visit): void {
    if (!this.visits) {
      this.visits = [];
    }
    this.visits.push(visit);
    visit.pet = this; // Ensure bidirectional relationship is set
  }
}
