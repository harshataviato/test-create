/**
 * @file models/namedEntity.js
 * @description Extends `BaseEntity` with a `name` property.
 * Mimics Spring PetClinic's `NamedEntity.java`.
 */

const { DataTypes } = require('sequelize');
const BaseEntity = require('./baseEntity');

/**
 * @class NamedEntity
 * @extends BaseEntity
 * @description Sequelize model for an entity that has a name, extending BaseEntity.
 */
class NamedEntity extends BaseEntity {
  /**
   * @method initialize
   * @description Initializes the NamedEntity model with schema definition.
   * This method acts as a mixin to add properties to inheriting models.
   * @param {Sequelize} sequelize - The Sequelize instance.
   */
  static initialize(sequelize) {
    // Note: NamedEntity itself doesn't call super.init directly here.
    // Instead, its attributes are composed into models that use it.
    // This is a common pattern to simulate inheritance for attribute definition in Sequelize.
    // For simplicity, actual models will define these attributes directly.
  }

  /**
   * @property name
   * @description The name of the entity.
   * @type {string}
   */
  // The 'name' attribute will be defined in actual models that inherit from NamedEntity
  // e.g., PetType, Specialty.
  get name() {
    return this.getDataValue('name');
  }

  set name(value) {
    this.setDataValue('name', value);
  }

  /**
   * @method toString
   * @description Returns a string representation of the entity's name.
   * @returns {string} The name of the entity or '<null>' if name is not set.
   */
  toString() {
    const name = this.name;
    return name !== null ? name : '<null>';
  }
}

module.exports = NamedEntity;
