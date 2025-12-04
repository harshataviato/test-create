import { Entity, Column } from 'typeorm';
import { NamedEntity } from '../../common/entities/named.entity';

/**
 * @module Owners
 * @description
 * Represents a type of pet, such as 'cat', 'dog', 'lizard', etc.
 * This entity extends `NamedEntity`, inheriting `id` and `name` properties.
 */
@Entity('types') // Maps to the 'types' table in the database
export class PetType extends NamedEntity {
  // No additional properties are needed beyond NamedEntity's 'name'
  // and BaseEntity's 'id'.
}
