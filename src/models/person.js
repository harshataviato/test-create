/**
 * @file models/person.js
 * @description Extends `BaseEntity` with `firstName` and `lastName` properties.
 * Mimics Spring PetClinic's `Person.java`.
 */

const { DataTypes } = require('sequelize');
const BaseEntity = require('./baseEntity');

/**
 * @class Person
 * @extends BaseEntity
 * @description Sequelize model for a person, extending BaseEntity.
 * Includes `firstName` and `lastName` attributes.
 */
class Person extends BaseEntity {
  /**
   * @method initialize
   * @description Initializes the Person model with schema definition.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static initialize(sequelize) {
    // Note: Person itself doesn't call super.init directly here.
    // Instead, its attributes are composed into models that use it.
    // For simplicity, actual models will define these attributes directly.
  }

  /**
   * @property firstName
   * @description The first name of the person.
   * @type {string}
   */
  get firstName() {
    return this.getDataValue('first_name');
  }

  set firstName(value) {
    this.setDataValue('first_name', value);
  }

  /**
   * @property lastName
   * @description The last name of the person.
   * @type {string}
   */
  get lastName() {
    return this.getDataValue('last_name');
  }

  set lastName(value) {
    this.setDataValue('last_name', value);
  }
}

module.exports = Person;
