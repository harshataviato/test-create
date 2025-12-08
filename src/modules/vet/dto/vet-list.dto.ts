import { Vet } from '../entities/vet.entity';
import { Expose, Type } from 'class-transformer'; // Required for class-transformer decorators

/**
 * DTO (Data Transfer Object) for encapsulating a list of veterinarians.
 * This is primarily used for API responses when returning a collection of vets,
 * allowing for a root object to hold the list.
 */
export class VetListDto {
  /**
   * An array of veterinarian entities.
   * The `@Type(() => Vet)` decorator is crucial for `class-transformer`
   * to correctly serialize/deserialize nested `Vet` objects when this DTO is used.
   * `@Expose()` ensures the property is included in serialization if class-transformer is configured to exclude by default.
   */
  @Type(() => Vet)
  @Expose()
  vetList: Vet[] = []; // Initialize as an empty array to ensure it's always available
}
