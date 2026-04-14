/**
 * @file BaseEntity model.
 * @description Simple JavaScript class representing a base domain object with an `id` property.
 * Corresponds to Java's `BaseEntity.java`.
 * @author Google Senior Engineer
 */

class BaseEntity {
  /**
   * Creates an instance of BaseEntity.
   * @param {number|null} [id=null] - The unique identifier of the entity.
   */
  constructor(id = null) {
    this.id = id;
  }

  /**
   * Gets the ID of the entity.
   * @returns {number|null} The ID of the entity.
   */
  getId() {
    return this.id;
  }

  /**
   * Sets the ID of the entity.
   * @param {number|null} id - The new ID for the entity.
   */
  setId(id) {
    this.id = id;
  }

  /**
   * Checks if the entity is new (i.e., its ID is null).
   * @returns {boolean} True if the entity is new, false otherwise.
   */
  isNew() {
    return this.id === null;
  }
}

module.exports = BaseEntity;

