import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NamedEntity } from '../../../common/entities/named.entity'; // Adjust path as needed
import { PetType } from './pet-type.entity'; // Adjust path as needed
import { Owner } from './owner.entity'; // Adjust path as needed
import { Visit } from './visit.entity'; // Adjust path as needed

/**
 * Pet entity represents a pet in the clinic.
 * It extends `NamedEntity` and includes properties like birth date, type, owner, and visits.
 */
@Entity('pets') // Specifies the table name in the database
export class Pet extends NamedEntity {
  /**
   * The birth date of the pet.
   * Formatted as "YYYY-MM-DD".
   * This field cannot be null.
   * @example "2010-09-07"
   */
  @Column({ name: 'birth_date', type: 'date' })
  @IsDate({ message: 'birthDate.invalid' })
  @IsNotEmpty({ message: 'birthDate.required' })
  @Type(() => Date) // Ensure proper date transformation from string if needed
  birthDate: Date;

  /**
   * The type of the pet (e.g., Cat, Dog, Hamster).
   * This is a many-to-one relationship with `PetType` entity.
   * The type is eagerly loaded when a pet is retrieved.
   */
  @ManyToOne(() => PetType, (petType) => petType.pets, {
    eager: true, // Eagerly load pet type
  })
  @JoinColumn({ name: 'type_id' }) // Specifies the foreign key column in the 'pets' table
  @ValidateNested({ message: 'type.invalid' }) // Validate nested PetType object
  @Type(() => PetType)
  type: PetType;

  /**
   * The owner of the pet.
   * This is a many-to-one relationship with `Owner` entity.
   * The owner is not eagerly loaded to prevent circular dependencies in data fetching.
   */
  @ManyToOne(() => Owner, (owner) => owner.pets, { onDelete: 'CASCADE' }) // If owner deleted, pets deleted
  @JoinColumn({ name: 'owner_id' }) // Specifies the foreign key column in the 'pets' table
  owner: Owner;

  /**
   * A collection of visits made by this pet.
   * This is a one-to-many relationship with `Visit` entities, eagerly loaded.
   * If a pet is deleted, all its visits are also deleted (cascadeType: ALL).
   * Visits are ordered by their date in ascending order.
   */
  @OneToMany(() => Visit, (visit) => visit.pet, {
    cascade: ['insert', 'update'], // Cascade insert and update operations
    eager: true, // Eagerly load visits
  })
  @JoinColumn({ name: 'pet_id' }) // Specifies the foreign key column in the 'visits' table
  visits: Visit[] = []; // Initialize as an empty array

  /**
   * Adds a new visit to the pet's collection.
   * @param visit The visit to add.
   */
  addVisit(visit: Visit): void {
    if (!this.visits) {
      this.visits = [];
    }
    this.visits.push(visit);
  }
}
