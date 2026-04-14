/**
 * @file Specialty model.
 * @description Models a veterinarian's specialty (e.g., dentistry), extending `NamedEntity`.
 * Corresponds to Java's `Specialty.java`.
 * @author Google Senior Engineer
 */

const NamedEntity = require('./namedEntity');

class Specialty extends NamedEntity {
  /**
   * Creates an instance of Specialty.
   * @param {number|null} [id=null] - The unique identifier of the specialty.
   * @param {string} [name=''] - The name of the specialty.
   */
  constructor(id = null, name = '') {
    super(id, name); // Initialize parent (NamedEntity) properties
  }
}

module.exports = Specialty;
