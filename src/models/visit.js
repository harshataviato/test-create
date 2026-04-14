/**
 * @file Visit model.
 * @description Represents a visit for a pet, extending `BaseEntity` with a date and description.
 * Corresponds to Java's `Visit.java`.
 * @author Google Senior Engineer
 */

const BaseEntity = require('./baseEntity');

class Visit extends BaseEntity {
  /**
   * Creates a new instance of Visit.
   * @param {object} [data={}] - Object containing visit properties.
   * @param {number|null} [data.id=null] - The unique identifier of the visit.
   * @param {Date|string|null} [data.date=null] - The date of the visit. Defaults to the current date if not provided.
   * @param {string} [data.description=''] - A description of the visit.
   */
  constructor(data = {}) {
    super(data.id); // Initialize parent (BaseEntity) properties
    this.date = data.date ? new Date(data.date) : new Date(); // Defaults to current date if not provided
    this.description = data.description || '';
  }

  /**
   * Gets the date of the visit.
   * @returns {Date} The visit date.
   */
  getDate() {
    return this.date;
  }

  /**
   * Sets the date of the visit.
   * @param {Date|string} date - The new visit date.
   */
  setDate(date) {
    this.date = new Date(date);
  }

  /**
   * Gets the description of the visit.
   * @returns {string} The visit description.
   */
  getDescription() {
    return this.description;
  }

  /**
   * Sets the description of the visit.
   * @param {string} description - The new visit description.
   */
  setDescription(description) {
    this.description = description;
  }
}

module.exports = Visit;

