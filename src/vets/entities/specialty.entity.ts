import { Entity, Column } from 'typeorm';
import { NamedEntity } from '../../common/entities/named.entity';

/**
 * @module Vets
 * @description
 * Represents a veterinarian's specialty, such as "dentistry" or "radiology".
 * This entity extends `NamedEntity`, inheriting `id` and `name` properties.
 */
@Entity('specialties') // Maps to the 'specialties' table in the database
export class Specialty extends NamedEntity {
  // No additional properties are needed beyond NamedEntity's 'name'
  // and BaseEntity's 'id'.
}
