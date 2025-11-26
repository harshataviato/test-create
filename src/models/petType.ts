/**
 * @module models/petType
 * @description Defines the PetType interface, representing the various types
 * of pets managed by the PetClinic application (e.g., Cat, Dog, Hamster).
 * It extends the NamedEntity interface, providing an ID and a name for each type.
 */

import { NamedEntity } from '@models/namedEntity';

/**
 * @interface PetType
 * @extends {NamedEntity}
 * @description Represents a simple domain object for a pet type.
 * Examples include 'cat', 'dog', 'lizard', etc.
 */
export interface PetType extends NamedEntity {
  // Additional properties specific to PetType can be added here if needed.
  // Currently, NamedEntity (id, name) is sufficient.
}
