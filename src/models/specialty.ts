/**
 * @module models/specialty
 * @description Defines the Specialty interface, representing a specific
 * area of expertise for veterinarians in the PetClinic application (e.g., dentistry).
 * It extends the NamedEntity interface, providing an ID and a name for each specialty.
 */

import { NamedEntity } from '@models/namedEntity';

/**
 * @interface Specialty
 * @extends {NamedEntity}
 * @description Models a veterinarian's specialty (for example, dentistry, radiology, surgery).
 */
export interface Specialty extends NamedEntity {
  // No additional properties beyond NamedEntity's id and name are currently needed.
}
