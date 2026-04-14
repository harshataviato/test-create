/**
 * @file Pet model.
 * @description Represents a pet in the PetClinic, extending `NamedEntity` with birth date,
 * pet type, and a collection of `Visit` objects.
 * Corresponds to Java's `Pet.java`.
 * @author Google Senior Engineer
 */

const NamedEntity = require('./namedEntity');
const PetType = require('./petType'); // Import PetType model for association
const Visit = require('./visit'); // Import Visit model for association

class Pet extends NamedEntity {
  /**
   * Creates an instance of Pet.
   * @param {object} [data={}] - Object containing pet properties.
   * @param {number|null} [data.id=null] - The unique identifier of the pet.
   * @param {string} [data.name=''] - The name of the pet.
   * @param {Date|string|null} [data.birthDate=null] - The birth date of the pet. Can be Date object or 'YYYY-MM-DD' string.
   * @param {PetType|object|null} [data.type=null] - The type of the pet (e.g., Cat, Dog). Can be PetType instance or plain object.
   * @param {Array<Visit>} [data.visits=[]] - A set of visits made by this pet.
   */
  constructor(data = {}) {
    super(data.id, data.name); // Initialize parent (NamedEntity) properties
    this.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    this.type = data.type ? new PetType(data.type.id, data.type.name) : null;
    // Initialize visits as a Set, converting raw data objects to Visit instances
    this.visits = new Set((data.visits || []).map(visitData => new Visit(visitData)));
  }

  /**
   * Gets the birth date of the pet.
   * @returns {Date|null} The birth date.
   */
  getBirthDate() {
    return this.birthDate;
  }

  /**
   * Sets the birth date of the pet.
   * @param {Date|string|null} birthDate - The new birth date. Can be Date object or 'YYYY-MM-DD' string.
   */
  setBirthDate(birthDate) {
    this.birthDate = birthDate ? new Date(birthDate) : null;
  }

  /**
   * Gets the type of the pet.
   * @returns {PetType|null} The pet type.
   */
  getType() {
    return this.type;
  }

  /**
   * Sets the type of the pet.
   * @param {PetType|object|null} type - The new pet type. Can be PetType instance or plain object.
   */
  setType(type) {
    this.type = type ? new PetType(type.id, type.name) : null;
  }

  /**
   * Gets the collection of visits made by this pet.
   * Returns a new array for easier iteration, ordered by date ascending.
   * @returns {Array<Visit>} The sorted list of visits.
   */
  getVisits() {
    return Array.from(this.visits).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Adds a visit for this pet.
   * @param {Visit} visit - The visit to add.
   */
  addVisit(visit) {
    this.visits.add(visit);
  }
}

module.exports = Pet;
