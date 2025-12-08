import { PartialType } from '@nestjs/mapped-types';
import { CreateOwnerDto } from './create-owner.dto';
import { IsNumber, IsOptional } from 'class-validator';

/**
 * DTO for updating an existing Owner.
 * Inherits all properties and validations from `CreateOwnerDto` but makes them optional.
 * Includes an optional `id` for internal handling.
 */
export class UpdateOwnerDto extends PartialType(CreateOwnerDto) {
  /**
   * The ID of the owner.
   * This is typically passed in the URL path, but might be present in the body.
   * It's optional here, but crucial for identifying the entity to update.
   */
  @IsOptional()
  @IsNumber({}, { message: 'id.invalid' })
  id?: number;
}
