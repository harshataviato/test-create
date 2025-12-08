import { Entity, Column, OneToMany } from 'typeorm';
import { NamedEntity } from '../../../common/entities/named.entity'; // Adjust path as needed
import { Pet } from './pet.entity';

/**
 * PetType entity represents the classification of a pet (e.g., Cat, Dog, Hamster).
 * It extends `NamedEntity` to include a name property.
 */
@Entity('types') // Specifies the table name in the database
export class PetType extends NamedEntity {
  // PetType currently only needs the 'name' from NamedEntity.
  // Add other properties here if necessary in the future.

  /**
   * A list of pets associated with this pet type.
   * This is a one-to-many relationship with `Pet` entities, not eagerly loaded by default
   * to avoid potential circular references or performance issues.
   */
  @OneToMany(() => Pet, (pet) => pet.type)
  pets: Pet[];
}
