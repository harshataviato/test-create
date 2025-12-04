import { PartialType } from '@nestjs/mapped-types';
import { CreateOwnerDto } from './create-owner.dto';

/**
 * @module Owners
 * @description
 * Data Transfer Object (DTO) for updating an existing `Owner`.
 * This DTO inherits all validation rules from `CreateOwnerDto`
 * but makes all properties optional using `PartialType` from `@nestjs/mapped-types`.
 * This allows for partial updates of an owner's information.
 */
export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {
  // No additional properties are defined here.
  // All properties from CreateOwnerDto are inherited and made optional.
}
