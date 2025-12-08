import { Entity, ManyToMany } from 'typeorm';
import { NamedEntity } from '../../../common/entities/named.entity'; // Adjust path as needed
import { Vet } from './vet.entity';

/**
 * Specialty entity models a veterinarian's specialty (e.g., dentistry, radiology).
 * It extends `NamedEntity` to include a name property.
 */
@Entity('specialties') // Specifies the table name in the database
export class Specialty extends NamedEntity {
  // Specialty currently only needs the 'name' from NamedEntity.
  // Add other properties here if necessary in the future.

  /**
   * Many-to-many relationship with `Vet` entities.
   * Vets can have multiple specialties, and specialties can be held by multiple vets.
   * This side does not define the JoinTable to avoid circular definition.
   */
  @ManyToMany(() => Vet, (vet) => vet.specialties)
  vets: Vet[];
}
