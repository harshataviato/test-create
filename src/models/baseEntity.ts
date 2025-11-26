/**
 * @module models/baseEntity
 * @description Defines the BaseEntity class, a fundamental building block for
 * domain objects in the PetClinic application. It provides a common 'id' property
 * for entities requiring a unique identifier.
 */

/**
 * @interface BaseEntity
 * @description Represents a simple JavaBean domain object with an 'id' property.
 * This interface is used as a base for other domain objects that need a unique identifier.
 * In a real application with a database, this would typically map to a primary key.
 */
export interface BaseEntity {
  /**
   * @property {number | undefined} id
   * @description The unique identifier for the entity.
   * It is `undefined` when the entity is new and has not yet been persisted
   * (or had an ID assigned by the data store).
   */
  id?: number;

  /**
   * @property {boolean} isNew
   * @description A flag indicating whether the entity is new (not yet persisted)
   * or an existing entity. This is derived from whether the 'id' property is undefined.
   */
  isNew: boolean;
}
