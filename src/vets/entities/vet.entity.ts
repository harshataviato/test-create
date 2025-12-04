import { Entity, ManyToMany, JoinTable, JoinColumn, Column } from 'typeorm';
import { Person } from '../../common/entities/person.entity';
import { Specialty } from './specialty.entity';
import { MaxLength } from 'class-validator'; // Added for firstName/lastName length, though inherited

/**
 * @module Vets
 * @description
 * Represents a veterinarian in the PetClinic system.
 * This entity extends `Person`, inheriting `id`, `firstName`, and `lastName` properties.
 * Vets can have multiple specialties.
 */
@Entity('vets') // Maps to the 'vets' table in the database
export class Vet extends Person {
  /**
   * A collection of specialties associated with this veterinarian.
   * This is a Many-to-Many relationship, indicating a vet can have multiple specialties
   * and a specialty can be held by multiple vets.
   * The relationship is managed through a join table `vet_specialties`.
   */
  @ManyToMany(() => Specialty, { eager: true }) // Eagerly load specialties whenever a Vet is loaded
  @JoinTable({
    name: 'vet_specialties', // Name of the join table
    joinColumn: { name: 'vet_id', referencedColumnName: 'id' }, // Column for Vet ID in join table
    inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' }, // Column for Specialty ID in join table
  })
  specialties: Specialty[];

  /**
   * Returns the number of specialties this vet has.
   * @returns {number} The count of specialties.
   */
  getNrOfSpecialties(): number {
    return this.specialties?.length || 0;
  }

  /**
   * Adds a specialty to the vet's list of specialties.
   * Initializes the specialties array if it's null or undefined.
   * @param {Specialty} specialty - The specialty to add.
   */
  addSpecialty(specialty: Specialty): void {
    if (!this.specialties) {
      this.specialties = [];
    }
    this.specialties.push(specialty);
  }
}
