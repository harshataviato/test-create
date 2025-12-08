import { Vet } from './vet.entity';
import { XmlElement, XmlRootElement } from 'class-transformer'; // For XML serialization (if needed)

/**
 * Vets is a simple domain object representing a list of veterinarians.
 * It's primarily used as a wrapper for XML/JSON marshalling, allowing a root element
 * for a collection of `Vet` objects, similar to `MarshallingView` in Spring.
 */
// @XmlRootElement annotation is part of class-transformer, used for XML serialization.
// In a typical NestJS app, JSON is common, but this matches Java's JAXB equivalent.
@XmlRootElement({ name: 'vets' })
export class VetListDto {
  /**
   * The list of veterinarians.
   * @example
   * [
   *   { "id": 1, "firstName": "James", "lastName": "Carter", "specialties": [] },
   *   { "id": 2, "firstName": "Helen", "lastName": "Leary", "specialties": [{ "id": 1, "name": "radiology" }] }
   * ]
   */
  @XmlElement({ name: 'vet', type: () => Vet }) // Each item in the list will be marshalled as a 'vet' element
  vetList: Vet[] = []; // Initialize as an empty array

  /**
   * Returns the list of veterinarians.
   * If the list is null, it initializes it as an empty ArrayList.
   * @returns The list of veterinarians.
   */
  getVetList(): Vet[] {
    if (!this.vetList) {
      this.vetList = [];
    }
    return this.vetList;
  }
}
