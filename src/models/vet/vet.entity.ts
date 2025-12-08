/**
 * @module models/vet/vet.entity
 * @description
 * Defines the `Vet` entity, extending `Person` and including a collection of `Specialty` areas.
 */

import { Entity, ManyToMany, JoinTable, JoinColumn, Relation } from 'typeorm';
import { Person } from '../person.entity';
import { Specialty } from './specialty.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Vet entity represents a veterinarian in the clinic.
 * It extends the `Person` entity and includes a many-to-many relationship with `Specialty` entities.
 */
@Entity('vets')
export class Vet extends Person {
  /**
   * A collection of specialties held by this veterinarian.
   * - `@ManyToMany`: Many vets can have many specialties, and many specialties can be held by many vets.
   * - `() => Specialty`: Specifies the target entity.
   * - `{ eager: true }`: Specialties will be loaded automatically when a vet is retrieved.
   * - `@JoinTable`: Defines the junction table for the many-to-many relationship.
   *   - `name: 'vet_specialties'`: Name of the junction table.
   *   - `joinColumn: { name: 'vet_id', referencedColumnName: 'id' }`: Column in `vet_specialties` referencing `vets.id`.
   *   - `inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' }`: Column in `vet_specialties` referencing `specialties.id`.
   */
  @ManyToMany(() => Specialty, { eager: true })
  @JoinTable({
    name: 'vet_specialties',
    joinColumn: { name: 'vet_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' },
  })
  @Type(() => Specialty) // Needed for class-transformer to correctly instantiate nested objects
  @ValidateNested({ each: true }) // Validates each specialty in the collection
  @IsOptional() // Specialties are optional
  specialties: Relation<Specialty>[] = []; // Use Relation<T>[] for explicit type safety

  /**
   * Returns the internal list of specialties. This method is used to manage the collection directly.
   * If the specialties array is not initialized, it initializes it as an empty array.
   *
   * @returns {Relation<Specialty>[]} The internal list of specialties.
   */
  protected getSpecialtiesInternal(): Relation<Specialty>[] {
    if (this.specialties === undefined) {
      this.specialties = [];
    }
    return this.specialties;
  }

  /**
   * Returns a sorted list of specialties for display purposes.
   * Sorts specialties alphabetically by their name.
   *
   * @returns {Relation<Specialty>[]} A sorted list of specialties.
   */
  getSortedSpecialties(): Relation<Specialty>[] {
    return this.getSpecialtiesInternal().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }

  /**
   * Returns the number of specialties this vet has.
   *
   * @returns {number} The count of specialties.
   */
  getNrOfSpecialties(): number {
    return this.getSpecialtiesInternal().length;
  }

  /**
   * Adds a specialty to the vet's collection of specialties.
   *
   * @param {Specialty} specialty - The specialty to add.
   */
  addSpecialty(specialty: Specialty): void {
    this.getSpecialtiesInternal().push(specialty);
  }
}
