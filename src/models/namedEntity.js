/**
 * @file NamedEntity model.
 * @description Simple JavaScript class extending `BaseEntity` with a `name` property.
 * Corresponds to Java's `NamedEntity.java`.
 * @author Google Senior Engineer
 */

const BaseEntity = require('./baseEntity');

class NamedEntity extends BaseEntity {
  /**
   * Creates an instance of NamedEntity.
   * @param {number|null} [id=null] - The unique identifier of the entity.
   * @param {string} [name=''] - The name of the entity.
   */
  constructor(id = null, name = '') {
    super(id); // Call the constructor of the parent class (BaseEntity)
    this.name = name;
  }

  /**
   * Gets the name of the entity.
   * @returns {string} The name of the entity.
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the name of the entity.
   * @param {string} name - The new name for the entity.
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Returns a string representation of the entity (its name).
   * @returns {string} The name of the entity, or '<null>' if name is not set.
   */
  toString() {
    return this.name || '<null>';
  }
}

module.exports = NamedEntity;
