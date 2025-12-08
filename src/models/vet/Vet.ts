/**
 * @module models/vet/Vet
 * @description Defines the Vet entity, representing a veterinarian with their specialties.
 *              Mimics Spring's `Vet.java`.
 */

import { Entity, JoinTable, ManyToMany, Column } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Person } from '@models/Person';
import { Specialty } from './Specialty';

/**
 * @class Vet
 * @extends {Person}
 * @description Simple JavaBean domain object representing a veterinarian.
 */
@Entity('vets')
export class Vet extends Person {
  /**
   * @property {Specialty[]} specialties
   * @description A collection of specialties held by the veterinarian.
   * @decorator `@ManyToMany(() => Specialty, { eager: true })` - Many-to-many relationship with Specialty.
   *              `eager: true` means specialties will be loaded automatically when a vet is retrieved.
   * @decorator `@JoinTable({ name: 'vet_specialties', joinColumn: { name: 'vet_id' }, inverseJoinColumn: { name: 'specialty_id' } })`
   *              Defines the join table `vet_specialties` and its foreign key columns.
   * @decorator `@Type(() => Specialty)` - Ensures proper transformation when deserializing.
   */
  @ManyToMany(() => Specialty, { eager: true })
  @JoinTable({
    name: 'vet_specialties',
    joinColumn: { name: 'vet_id' },
    inverseJoinColumn: { name: 'specialty_id' },
  })
  @Type(() => Specialty)
  specialties: Specialty[];

  constructor(partial?: Partial<Vet>) {
    super();
    if (partial) {
      Object.assign(this, partial);
      // Ensure specialties array is initialized if not provided or empty
      if (!this.specialties) {
        this.specialties = [];
      }
    } else {
      this.specialties = [];
    }
  }

  /**
   * @method getSpecialties
   * @description Returns the list of specialties, sorted by name.
   * @returns {Specialty[]} A sorted array of specialties.
   */
  getSpecialties(): Specialty[] {
    // Ensure specialties is always an array
    if (!this.specialties) {
      this.specialties = [];
    }
    // Sort specialties by name before returning
    return this.specialties.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * @method getNrOfSpecialties
   * @description Returns the number of specialties the vet has.
   * @returns {number} The count of specialties.
   */
  getNrOfSpecialties(): number {
    return this.specialties ? this.specialties.length : 0;
  }

  /**
   * @method addSpecialty
   * @description Adds a specialty to the vet's list of specialties.
   * @param {Specialty} specialty - The specialty to add.
   */
  addSpecialty(specialty: Specialty): void {
    if (!this.specialties) {
      this.specialties = [];
    }
    // Add only if not already present to avoid duplicates
    if (!this.specialties.some(s => s.id === specialty.id)) {
      this.specialties.push(specialty);
    }
  }
}
