import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PetTypeRepository } from './pet-type.repository';
import { PetType } from './entities/pet-type.entity';

/**
 * @module Owners
 * @description
 * A custom NestJS `PipeTransform` that converts a `PetType` name string from a request
 * (e.g., from a form submission) into a `PetType` entity.
 * This is analogous to Spring's `PetTypeFormatter` for handling `PetType` objects in forms.
 */
@Injectable()
export class PetTypePipe implements PipeTransform<string, Promise<PetType>> {
  constructor(private readonly petTypeRepository: PetTypeRepository) {}

  /**
   * Transforms the incoming `value` (a pet type name string) into a `PetType` entity.
   * If the pet type name is not found in the repository, it throws a `BadRequestException`.
   *
   * @param {string} value - The pet type name string from the request.
   * @param {ArgumentMetadata} metadata - Metadata about the argument being transformed.
   * @returns {Promise<PetType>} A promise that resolves to the `PetType` entity.
   * @throws {BadRequestException} If the pet type is not found.
   */
  async transform(value: string, metadata: ArgumentMetadata): Promise<PetType> {
    if (!value) {
      throw new BadRequestException('Pet type is required'); // Or handle null/undefined as per business logic
    }

    const petTypes = await this.petTypeRepository.findPetTypes();
    const foundType = petTypes.find((type) => type.name.toLowerCase() === value.toLowerCase());

    if (!foundType) {
      throw new BadRequestException(`Invalid pet type: "${value}". Type not found.`);
    }

    return foundType;
  }
}
