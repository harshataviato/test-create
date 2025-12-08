/**
 * @module models/vet/vets.dto
 * @description
 * Defines a Data Transfer Object (DTO) for wrapping a list of veterinarians.
 * This is primarily used for API responses where a root element for a collection is desired.
 */

import { Vet } from './vet.entity';

/**
 * VetsDto is a simple data structure to hold a list of `Vet` entities.
 * It's often used for XML/JSON marshalling where a wrapper object for collections is expected.
 */
export class VetsDto {
  /**
   * The list of veterinarians.
   */
  vetList: Vet[] = [];
}
