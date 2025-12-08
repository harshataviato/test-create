import { Entity, ManyToMany, JoinTable, Column } from 'typeorm';
import { Person } from '../../../common/entities/person.entity'; // Adjust path as needed
import { Specialty } from './specialty.entity';
import { IsNotEmpty } from 'class-validator';
import { XmlElement } from 'class-transformer'; // For XML serialization (if needed)

/**
 * Vet entity represents a veterinarian in the clinic.
 * It extends the `Person` entity and includes a collection of `Specialty` objects.
 */
@Entity('vets') // Specifies the table name in the database
export class Vet extends Person {
  /**
   * A collection of specialties held by this veterinarian.
   * This is a many-to-many relationship with `Specialty` entities.
   * The join table `vet_specialties` is used to manage this relationship.
   * Specialties are eagerly loaded when a vet is retrieved.
   */
  @ManyToMany(() => Specialty, { eager: true, cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'vet_specialties', // Name of the join table
    joinColumn: { name: 'vet_id', referencedColumnName: 'id' }, // Column for vet ID
    inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' }, // Column for specialty ID
  })
  // @XmlElement annotation is part of class-transformer, used for XML serialization
  // In a typical NestJS app, JSON is common, but this matches Java's JAXB equivalent.
  @XmlElement({ name: 'specialty' })
  specialties: Specialty[] = []; // Initialize as an empty array

  /**
   * Returns the list of specialties sorted by name.
   * @returns A sorted list of specialties.
   */
  getSpecialties(): Specialty[] {
    return this.specialties.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Returns the number of specialties this veterinarian has.
   * @returns The count of specialties.
   */
  getNrOfSpecialties(): number {
    return this.specialties.length;
  }

  /**
   * Adds a specialty to the veterinarian's collection.
   * @param specialty The specialty to add.
   */
  addSpecialty(specialty: Specialty): void {
    this.specialties.push(specialty);
  }
}
