/**
 * @file Owner model.
 * @description Represents an owner in the PetClinic, extending `Person` with address, city, and telephone details,
 * and a collection of `Pet` objects.
 * Corresponds to Java's `Owner.java`.
 * @author Google Senior Engineer
 */

const Person = require('./person');
const Pet = require('./pet'); // Import Pet model for association
const Visit = require('./visit'); // Import Visit model for association

class Owner extends Person {
  /**
   * Creates an instance of Owner.
   * @param {object} [data={}] - Object containing owner properties.
   * @param {number|null} [data.id=null] - The unique identifier of the owner.
   * @param {string} [data.firstName=''] - The first name of the owner.
   * @param {string} [data.lastName=''] - The last name of the owner.
   * @param {string} [data.address=''] - The address of the owner.
   * @param {string} [data.city=''] - The city of the owner.
   * @param {string} [data.telephone=''] - The telephone number of the owner.
   * @param {Array<Pet>} [data.pets=[]] - A list of pets owned by this owner.
   */
  constructor(data = {}) {
    super(data.id, data.firstName, data.lastName); // Initialize parent (Person) properties
    this.address = data.address || '';
    this.city = data.city || '';
    this.telephone = data.telephone || '';
    // Initialize pets as an array, converting raw data objects to Pet instances
    this.pets = (data.pets || []).map(petData => {
      // Ensure pets also have their visits initialized as Visit instances
      if (petData.visits) {
        petData.visits = petData.visits.map(visitData => new Visit(visitData));
      }
      return new Pet(petData);
    });
  }

  /**
   * Gets the address of the owner.
   * @returns {string} The address.
   */
  getAddress() {
    return this.address;
  }

  /**
   * Sets the address of the owner.
   * @param {string} address - The new address.
   */
  setAddress(address) {
    this.address = address;
  }

  /**
   * Gets the city of the owner.
   * @returns {string} The city.
   */
  getCity() {
    return this.city;
  }

  /**
   * Sets the city of the owner.
   * @param {string} city - The new city.
   */
  setCity(city) {
    this.city = city;
  }

  /**
   * Gets the telephone number of the owner.
   * @returns {string} The telephone number.
   */
  getTelephone() {
    return this.telephone;
  }

  /**
   * Sets the telephone number of the owner.
   * @param {string} telephone - The new telephone number.
   */
  setTelephone(telephone) {
    this.telephone = telephone;
  }

  /**
   * Gets the list of pets owned by this owner.
   * @returns {Array<Pet>} The list of pets.
   */
  getPets() {
    return this.pets;
  }

  /**
   * Adds a pet to the owner's list of pets.
   * If the pet is new (has no ID), it's simply added to the list.
   * @param {Pet} pet - The pet to add.
   */
  addPet(pet) {
    if (pet.isNew()) {
      this.pets.push(pet);
    }
  }

  /**
   * Returns the Pet with the given name, or null if none found for this Owner.
   * @param {string} name - The name of the pet to find.
   * @param {boolean} [ignoreNew=false] - Whether to ignore new pets (pets that are not saved yet).
   * @returns {Pet|null} The Pet with the given name, or null if no such Pet exists for this Owner.
   */
  getPet(name, ignoreNew = false) {
    for (const pet of this.pets) {
      if (pet.getName() && pet.getName().toLowerCase() === name.toLowerCase()) {
        if (!ignoreNew || !pet.isNew()) {
          return pet;
        }
      }
    }
    return null;
  }

  /**
   * Returns the Pet with the given ID, or null if none found for this Owner.
   * @param {number} id - The ID of the pet to find.
   * @returns {Pet|null} The Pet with the given ID, or null if no such Pet exists for this Owner.
   */
  getPetById(id) {
    for (const pet of this.pets) {
      if (!pet.isNew() && pet.getId() === id) {
        return pet;
      }
    }
    return null;
  }

  /**
   * Adds the given `Visit` to the `Pet` with the given identifier.
   * @param {number} petId - The identifier of the `Pet`.
   * @param {Visit} visit - The visit to add.
   * @throws {Error} If `petId` or `visit` is null, or if the `Pet` is not found.
   */
  addVisit(petId, visit) {
    if (petId === null || visit === null) {
      throw new Error("Pet identifier and visit must not be null!");
    }

    const pet = this.getPetById(petId);

    if (pet === null) {
      throw new Error(`Invalid Pet identifier: Pet with id ${petId} not found.`);
    }

    pet.addVisit(visit);
  }

  /**
   * Returns a string representation of the Owner object.
   * @returns {string} String representation of the owner.
   */
  toString() {
    return `Owner(id=${this.getId()}, new=${this.isNew()}, lastName='${this.getLastName()}', firstName='${this.getFirstName()}', address='${this.address}', city='${this.city}', telephone='${this.telephone}')`;
  }
}

module.exports = Owner;
