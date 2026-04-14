/**
 * @file Vet model.
 * @description Represents a veterinarian in the PetClinic, extending `Person` with a collection of `Specialty` objects.
 * Corresponds to Java's `Vet.java` and `Vets.java`.
 * @author Google Senior Engineer
 */

const Person = require('./person');
const Specialty = require('./specialty'); // Import Specialty model for association

class Vet extends Person {
  /**
   * Creates an instance of Vet.
   * @param {object} [data={}] - Object containing vet properties.
   * @param {number|null} [data.id=null] - The unique identifier of the vet.
   * @param {string} [data.firstName=''] - The first name of the vet.
   * @param {string} [data.lastName=''] - The last name of the vet.
   * @param {Array<Specialty>} [data.specialties=[]] - A list of specialties the vet has.
   */
  constructor(data = {}) {
    super(data.id, data.firstName, data.lastName); // Initialize parent (Person) properties
    // Initialize specialties as a Set, converting raw data objects to Specialty instances
    this.specialties = new Set((data.specialties || []).map(specData => new Specialty(specData.id, specData.name)));
  }

  /**
   * Gets the internal set of specialties for the vet.
   * This method is "protected" to align with the Java version, used internally for direct set manipulation.
   * @returns {Set<Specialty>} The internal set of specialties.
   */
  _getSpecialtiesInternal() {
    return this.specialties;
  }

  /**
   * Gets a sorted list of specialties for the vet.
   * The list is sorted by specialty name.
   * @returns {Array<Specialty>} A sorted array of specialties.
   */
  getSpecialties() {
    return Array.from(this.specialties).sort((a, b) => a.getName().localeCompare(b.getName()));
  }

  /**
   * Gets the number of specialties the vet has.
   * @returns {number} The count of specialties.
   */
  getNrOfSpecialties() {
    return this.specialties.size;
  }

  /**
   * Adds a specialty to the vet's list of specialties.
   * @param {Specialty} specialty - The specialty to add.
   */
  addSpecialty(specialty) {
    if (specialty instanceof Specialty) {
      this.specialties.add(specialty);
    } else {
      console.warn("Attempted to add non-Specialty object to Vet's specialties.");
    }
  }
}

/**
 * Simple container object representing a list of veterinarians.
 * Corresponds to Java's `Vets.java`.
 */
class Vets {
  /**
   * Creates an instance of Vets.
   * @param {Array<Vet>} [vetList=[]] - A list of Vet objects.
   */
  constructor(vetList = []) {
    this.vetList = vetList;
  }

  /**
   * Gets the list of veterinarians.
   * If the list is null or undefined, it initializes it as an empty array.
   * @returns {Array<Vet>} The list of veterinarians.
   */
  getVetList() {
    if (!this.vetList) {
      this.vetList = [];
    }
    return this.vetList;
  }
}

module.exports = {
  Vet,
  Vets
};

