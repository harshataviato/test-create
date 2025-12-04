import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';

/**
 * @module Pets
 * @description
 * Data Transfer Object (DTO) for updating an existing `Pet`.
 * This DTO inherits all validation rules from `CreatePetDto`
 * but makes all properties optional using `PartialType` from `@nestjs/mapped-types`.
 * This allows for partial updates of a pet's information.
 */
export class UpdatePetDto extends PartialType(CreatePetDto) {
  // No additional properties are defined here.
  // All properties from CreatePetDto are inherited and made optional.
}
