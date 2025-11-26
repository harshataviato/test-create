/**
 * @module models/vet
 * @description Defines the Vet interface, representing a veterinarian
 * in the PetClinic application. It extends the Person interface and
 * includes a collection of specialties.
 */

import { Person } from '@models/person';
import { Specialty } from '@models/specialty';

/**
 * @interface Vet
 * @extends {Person}
 * @description Represents a simple JavaBean domain object for a veterinarian.
 * A vet has personal details (first name, last name) and a set of specialties.
 */
export interface Vet extends Person {
  /**
   * @property {Specialty[]} specialties
   * @description A collection of medical specialties this vet possesses (e.g., radiology, surgery).
   * Initialized as an empty array or a set of Specialty objects.
   */
  specialties: Specialty[];
}

/**
 * @interface Vets
 * @description Simple domain object representing a list of veterinarians.
 * Primarily used as a wrapper for returning a collection of Vet objects
 * in API responses, ensuring consistency with the original Spring XML/JSON marshalling.
 */
export interface Vets {
  /**
   * @property {Vet[]} vetList
   * @description The actual list of veterinarian objects.
   */
  vetList: Vet[];
}
