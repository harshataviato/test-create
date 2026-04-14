/**
 * @file Person model.
 * @description Simple JavaScript class extending `BaseEntity` with `firstName` and `lastName` properties.
 * Corresponds to Java's `Person.java`.
 * @author Google Senior Engineer
 */

const BaseEntity = require('./baseEntity');

class Person extends BaseEntity {
  /**
   * Creates an instance of Person.
   * @param {number|null} [id=null] - The unique identifier of the person.
   * @param {string} [firstName=''] - The first name of the person.
   * @param {string} [lastName=''] - The last name of the person.
   */
  constructor(id = null, firstName = '', lastName = '') {
    super(id); // Call the constructor of the parent class (BaseEntity)
    this.firstName = firstName;
    this.lastName = lastName;
  }

  /**
   * Gets the first name of the person.
   * @returns {string} The first name.
   */
  getFirstName() {
    return this.firstName;
  }

  /**
   * Sets the first name of the person.
   * @param {string} firstName - The new first name.
   */
  setFirstName(firstName) {
    this.firstName = firstName;
  }

  /**
   * Gets the last name of the person.
   * @returns {string} The last name.
   */
  getLastName() {
    return this.lastName;
  }

  /**
   * Sets the last name of the person.
   * @param {string} lastName - The new last name.
   */
  setLastName(lastName) {
    this.lastName = lastName;
  }
}

module.exports = Person;
