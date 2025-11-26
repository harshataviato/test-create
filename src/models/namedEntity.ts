/**
 * @module models/namedEntity
 * @description Extends BaseEntity by adding a 'name' property.
 * This interface is used as a base for domain objects that require both
 * an ID and a human-readable name.
 */

import { BaseEntity } from '@models/baseEntity';

/**
 * @interface NamedEntity
 * @extends {BaseEntity}
 * @description Represents a simple JavaBean domain object that extends `BaseEntity`
 * by adding a 'name' property. This is useful for entities like PetType or Specialty
 * where a name is a primary identifier or descriptor.
 */
export interface NamedEntity extends BaseEntity {
  /**
   * @property {string} name
   * @description The name of the entity.
   * This property is expected to be non-blank for valid entities.
   */
  name: string;
}
