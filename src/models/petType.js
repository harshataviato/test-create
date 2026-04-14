/**
 * @file PetType model.
 * @description Represents a type of pet (e.g., Cat, Dog, Hamster), extending `NamedEntity`.
 * Corresponds to Java's `PetType.java`.
 * @author Google Senior Engineer
 */

const NamedEntity = require('./namedEntity');

class PetType extends NamedEntity {
  /**
   * Creates an instance of PetType.
   * @param {number|null} [id=null] - The unique identifier of the pet type.
   * @param {string} [name=''] - The name of the pet type.
   */
  constructor(id = null, name = '') {
    super(id, name); // Initialize parent (NamedEntity) properties
  }
}

module.exports = PetType;

